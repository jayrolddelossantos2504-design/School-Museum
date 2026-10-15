import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration loaded from environment variables.

    Secrets and connection details live in the .env file (never in code).
    """

    DEBUG = False
    TESTING = False
    PREFERRED_URL_SCHEME = "http"

    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-only-change-me")

    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_PORT = int(os.environ.get("DB_PORT", "5432"))  # PostgreSQL default port
    DB_USER = os.environ.get("DB_USER", "")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
    DB_NAME = os.environ.get("DB_NAME", "school_museum")

    CLOUDINARY_CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY = os.environ.get("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET = os.environ.get("CLOUDINARY_API_SECRET", "")

    SITE_URL = os.environ.get("SITE_URL", "http://127.0.0.1:5000")

    MAX_CONTENT_LENGTH = int(os.environ.get("MAX_CONTENT_LENGTH", str(10 * 1024 * 1024)))

    # Secure session cookies.
    # Set SESSION_COOKIE_SECURE=1 in production (HTTPS) so cookies only travel
    # over HTTPS. Keep it 0 for local HTTP development.
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = os.environ.get("SESSION_COOKIE_SECURE", "0") == "1"
    REMEMBER_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SECURE = SESSION_COOKIE_SECURE


class DevelopmentConfig(Config):
    """Local development: HTTP, debug on."""

    DEBUG = True
    PREFERRED_URL_SCHEME = "http"


class ProductionConfig(Config):
    """Public deployment: HTTPS only, cookies secure, debug off.

    SECRET_KEY, DB_*, Cloudinary credentials, and SITE_URL must all be set as
    environment variables on the host. Do not rely on the defaults here.
    """

    DEBUG = False
    PREFERRED_URL_SCHEME = "https"

    # Force secure cookies regardless of the local .env value.
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = "Lax"


def get_config(name=None):
    """Return a config class chosen by ``name`` or the APP_ENV env var.

    Defaults to development so that running the app locally stays convenient.
    """
    name = (name or os.environ.get("APP_ENV", "development")).strip().lower()
    return {
        "production": ProductionConfig,
        "development": DevelopmentConfig,
    }.get(name, DevelopmentConfig)
