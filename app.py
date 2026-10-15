"""School Museum website — Flask application entry point.

Milestone 2: application foundation only.
- Configuration from environment variables (config.py)
- Safe MySQL access helpers (database.py)
- A development health-check route
- Basic logging and safe error handling
"""

import datetime
import logging
from logging.handlers import RotatingFileHandler
import os

from flask import Flask, jsonify, render_template

from admin import admin_bp
from auth import auth_bp
from config import Config
from database import get_cursor
from extensions import csrf, login_manager
import image_service
from public import public_bp


def configure_logging(app):
    """Send application logs to stderr and to a rotating log file."""
    if app.testing:
        return

    os.makedirs("logs", exist_ok=True)
    file_handler = RotatingFileHandler(
        "logs/app.log", maxBytes=1_000_000, backupCount=3, encoding="utf-8"
    )
    file_handler.setFormatter(
        logging.Formatter("%(asctime)s %(levelname)s [%(name)s] %(message)s")
    )
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)


def register_routes(app):
    @app.route("/health")
    def health():
        """Confirm the app runs and can reach MySQL.

        Returns only a status, never connection details or secrets.
        """
        try:
            with get_cursor(app) as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except Exception as exc:  # noqa: BLE001 - report safely, log details
            app.logger.error("Health check could not reach the database: %s", exc)
            return jsonify(status="error", database="unavailable"), 503

        return jsonify(status="ok", database="connected")


def register_template_globals(app):
    @app.context_processor
    def inject_globals():
        return {"current_year": datetime.date.today().year}


def register_blueprints(app):
    app.register_blueprint(public_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)


def register_error_handlers(app):
    @app.errorhandler(403)
    def forbidden(error):
        return render_template("403.html"), 403

    @app.errorhandler(404)
    def not_found(error):
        return render_template("404.html"), 404

    @app.errorhandler(413)
    def payload_too_large(error):
        return render_template("413.html"), 413

    @app.errorhandler(500)
    def server_error(error):
        return render_template("500.html"), 500


# Content Security Policy: tighten what the browser may load/execute.
# - scripts/styles are same-origin only (no inline JS anywhere)
# - images may come from this site or Cloudinary
# - the app never embeds frames of other sites
CSP = (
    "default-src 'self'; "
    "img-src 'self' data: https://res.cloudinary.com https://*.cloudinary.com; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "script-src 'self'; "
    "font-src 'self' https://fonts.gstatic.com; "
    "connect-src 'self'; "
    "form-action 'self'; "
    "frame-ancestors 'self'; "
    "base-uri 'self'"
)


def register_security_headers(app):
    @app.after_request
    def set_security_headers(response):
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
        response.headers.setdefault(
            "Referrer-Policy", "strict-origin-when-cross-origin"
        )
        response.headers.setdefault("Content-Security-Policy", CSP)
        response.headers.setdefault(
            "Permissions-Policy", "geolocation=(), microphone=(), camera=()"
        )
        return response


def check_production_config(app):
    """Log warnings for unsafe settings. Never prints secret values."""
    if app.testing or app.config.get("DEBUG"):
        return

    if not app.config.get("SESSION_COOKIE_SECURE"):
        app.logger.warning(
            "SESSION_COOKIE_SECURE is off — enable it for an HTTPS deployment."
        )
    if app.config.get("SECRET_KEY") in (None, "", "dev-only-change-me"):
        app.logger.warning(
            "SECRET_KEY is the default value — set a strong secret in the environment."
        )
    site_url = app.config.get("SITE_URL") or ""
    if not site_url.lower().startswith("https://"):
        app.logger.warning(
            "SITE_URL is not HTTPS (%r) — fix this before printing QR labels.",
            site_url,
        )
    if not os.environ.get("DB_PASSWORD"):
        app.logger.warning("DB_PASSWORD is not set in the environment.")


def create_app(config_class=Config):
    """Application factory."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Extensions first (blueprints below rely on them).
    csrf.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"
    login_manager.login_message = "Please log in to access this page."
    login_manager.login_message_category = "info"
    # Invalidate sessions when the client IP or user agent changes.
    login_manager.session_protection = "strong"

    # Cloudinary SDK (server-side only; secrets stay on the server).
    image_service.configure(app)

    register_blueprints(app)
    register_template_globals(app)
    configure_logging(app)
    register_routes(app)
    register_error_handlers(app)
    register_security_headers(app)
    check_production_config(app)

    return app


# Create app instance for gunicorn (production)
from config import get_config
app = create_app(get_config())


if __name__ == "__main__":
    from config import DevelopmentConfig

    app = create_app(DevelopmentConfig)
    app.run(debug=True)
