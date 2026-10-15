"""Production WSGI entry point for the School Museum website.

Serves the Flask app with the Waitress production server (no Flask dev server).
Configuration is chosen by the ``APP_ENV`` environment variable
(``production`` on the public host).

Usage:
    venv/Scripts/python.exe wsgi.py          # Windows
    python wsgi.py                           # Linux/macOS

Environment variables (see DEPLOYMENT.md):
    APP_ENV=production
    HOST=0.0.0.0          # bind address (default 0.0.0.0)
    PORT=8000             # listen port (default 8000)

Do NOT expose this port directly to the internet without HTTPS. Put it behind
a TLS-terminating reverse proxy (see DEPLOYMENT.md) and set SITE_URL to the
final https:// domain.
"""

import os

from waitress import serve

from app import create_app
from config import get_config

app = create_app(get_config())


if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8000"))
    threads = int(os.environ.get("WAITRESS_THREADS", "4"))

    app.logger.info("Starting Waitress on %s:%s (APP_ENV=%s)", host, port,
                    os.environ.get("APP_ENV", "development"))
    serve(app, host=host, port=port, threads=threads)
