"""QR code helper — encodes each item's permanent public URL.

A QR code must always point at the public item page (``/item/<token>``), never
at a Cloudinary image URL or an admin route. The ``Public_Token`` never changes,
so a printed label keeps working after the item text or images are edited.
"""

import io

import qrcode
from qrcode.constants import ERROR_CORRECT_M

# Hosts that must never appear on permanent, printed labels.
_LOCAL_HOSTS = ("localhost", "127.0.0.1", "0.0.0.0", ".local")


def build_item_url(app, token):
    """Return the full public URL for an item token."""
    base = (app.config.get("SITE_URL") or "").rstrip("/")
    return f"{base}/item/{token}"


def is_printable_url(url):
    """Return True when ``url`` is safe to print on a permanent label.

    A local or non-HTTPS URL is fine for testing but must not be mass-printed;
    the site needs a stable HTTPS domain first.
    """
    lowered = url.lower()
    if not lowered.startswith("https://"):
        return False
    return not any(host in lowered for host in _LOCAL_HOSTS)


def generate_qr_png(data, box_size=10, border=4):
    """Return PNG bytes for a QR code encoding ``data``.

    ``box_size`` and ``border`` are tuned for a crisp, easily scannable code on
    both screens and printed labels.
    """
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_M,
        box_size=box_size,
        border=border,
    )
    qr.add_data(data)
    qr.make(fit=True)
    image = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()
