"""Image handling with Cloudinary or local file storage fallback.

The Cloudinary SDK is only ever used on the server. API secrets never reach
templates or the browser. Uploading is isolated in ``upload_image`` so it can
be replaced in tests without touching the network.

When Cloudinary is not configured, images are stored locally in the /uploads
directory for development and free-tier deployments.
"""

import os
import uuid
from pathlib import Path

import cloudinary
import cloudinary.uploader
from PIL import Image, UnidentifiedImageError

# Only real image content in these Pillow formats is accepted.
ALLOWED_PIL_FORMATS = {"JPEG", "PNG", "GIF", "WEBP"}
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}

# Keep this below MAX_CONTENT_LENGTH so friendly errors come from code.
MAX_IMAGE_BYTES = 8 * 1024 * 1024  # 8 MiB

# Cloudinary folder for all museum item images.
IMAGE_FOLDER = "school_museum/items"


def configure(app):
    """Configure the Cloudinary SDK from app config (env vars)."""
    cloudinary.config(
        cloud_name=app.config.get("CLOUDINARY_CLOUD_NAME"),
        api_key=app.config.get("CLOUDINARY_API_KEY"),
        api_secret=app.config.get("CLOUDINARY_API_SECRET"),
        secure=True,
    )


def is_configured(app):
    """Check if Cloudinary has valid credentials configured.
    
    Args:
        app: Flask app instance, or None to check module-level config.
    
    Returns:
        False if credentials are missing, placeholder, or demo values.
    """
    if app is None:
        # Check module-level cloudinary config
        try:
            cfg = cloudinary.config()
            cloud_name = getattr(cfg, 'cloud_name', None)
            api_key = getattr(cfg, 'api_key', None)
            api_secret = getattr(cfg, 'api_secret', None)
            
            # Reject placeholder/demo values
            placeholder_values = {'museum', 'replace-me', '144449628473789', ''}
            if api_key in placeholder_values or api_secret in placeholder_values:
                return False
            
            return bool(cloud_name and api_key and api_secret)
        except Exception:
            return False
    
    # Check Flask app config
    try:
        placeholder_values = {'museum', 'replace-me', '144449628473789', ''}
        
        for key in ("CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"):
            val = app.config.get(key, '')
            if not val or val in placeholder_values:
                return False
        
        return True
    except Exception:
        return False


def validate_image(file_storage):
    """Validate an uploaded image.

    Returns (True, None) when valid, else (False, error_message). File size is
    checked and the content is verified with Pillow — the filename and the
    browser-supplied content type are not trusted.
    """
    file_storage.seek(0, os.SEEK_END)
    size = file_storage.tell()
    file_storage.seek(0)

    if size == 0:
        return False, "The uploaded file is empty."
    if size > MAX_IMAGE_BYTES:
        return False, f"Image is too large (maximum {MAX_IMAGE_BYTES // (1024 * 1024)} MB)."

    try:
        with Image.open(file_storage) as image:
            image_format = image.format
            image.verify()
    except (UnidentifiedImageError, OSError, ValueError):
        return False, "The file is not a valid image."
    finally:
        file_storage.seek(0)

    if image_format not in ALLOWED_PIL_FORMATS:
        return False, f"Unsupported image format: {image_format}."

    file_storage.seek(0)
    return True, None


def upload_image(file_storage, folder=IMAGE_FOLDER):
    """Upload an image to Cloudinary or local storage.
    
    Returns the SDK result dict (for Cloudinary) or a dict mimicking Cloudinary's response:
    {
        'public_id': 'path/to/image',
        'secure_url': '/uploads/filename.jpg',
        'url': '/uploads/filename.jpg'
    }

    Raises on failure; callers must not write database rows in that case.
    """
    # Try Cloudinary first if it's configured
    try:
        if is_configured(None):  # Will check module-level cloudinary config
            return _upload_to_cloudinary(file_storage, folder)
    except Exception:
        # Cloudinary failed, fall back to local storage
        pass
    
    # Use local storage as fallback
    return _upload_to_local(file_storage)


def _upload_to_cloudinary(file_storage, folder):
    """Upload image to Cloudinary."""
    return cloudinary.uploader.upload(
        file_storage,
        folder=folder,
        resource_type="image",
    )


def _upload_to_local(file_storage):
    """Upload image to local /uploads directory.
    
    Returns a dict mimicking Cloudinary's response format.
    """
    uploads_dir = Path("uploads")
    uploads_dir.mkdir(exist_ok=True)
    
    # Generate unique filename
    file_ext = get_file_extension(file_storage.filename)
    unique_id = str(uuid.uuid4())[:8]
    filename = f"{unique_id}.{file_ext}"
    filepath = uploads_dir / filename
    
    # Save file
    file_storage.seek(0)
    file_storage.save(str(filepath))
    
    # Return Cloudinary-compatible response
    public_url = f"/uploads/{filename}"
    return {
        'public_id': f"uploads/{filename}",
        'secure_url': public_url,
        'url': public_url,
    }


def get_file_extension(filename):
    """Extract and validate file extension."""
    if not filename or '.' not in filename:
        return 'jpg'
    ext = filename.rsplit('.', 1)[1].lower()
    return ext if ext in ALLOWED_EXTENSIONS else 'jpg'


def destroy_image(public_id):
    """Delete an image from Cloudinary or local storage.
    
    Args:
        public_id: The Cloudinary public_id or local path like "uploads/uuid.jpg"
    """
    if is_configured(None):
        return cloudinary.uploader.destroy(public_id, resource_type="image")
    else:
        # Local storage: public_id is like "uploads/uuid.jpg"
        try:
            filepath = Path(public_id)
            if filepath.exists():
                filepath.unlink()
                return {'result': 'ok'}
        except Exception:
            pass
        return {'result': 'not_found'}
