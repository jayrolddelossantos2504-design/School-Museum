"""Shared Flask extensions.

Kept in their own module so blueprints can import them without circular
imports against app.py.
"""

from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect

login_manager = LoginManager()
csrf = CSRFProtect()
