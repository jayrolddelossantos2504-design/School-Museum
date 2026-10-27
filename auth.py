"""Authentication blueprint: staff login and logout."""

from urllib.parse import urljoin, urlparse

from flask import Blueprint, current_app, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required, login_user, logout_user
from werkzeug.security import check_password_hash

from database import get_cursor
from extensions import login_manager
from forms import LoginForm
from activity_log import log_action

auth_bp = Blueprint("auth", __name__)


class AdminUser:
    """A logged-in staff member backed by a row in the `admins` table."""

    def __init__(self, admin_id, username, role, is_active):
        self.id = admin_id
        self.username = username
        self.role = role
        self._is_active = bool(is_active)

    # flask_login.UserMixin contract ------------------------------------
    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    @property
    def is_active(self):
        return self._is_active

    def get_id(self):
        return str(self.id)

    @classmethod
    def from_row(cls, row):
        return cls(
            admin_id=row["AdminID"],
            username=row["Username"],
            role=row["Role"],
            is_active=row["IsActive"],
        )


@login_manager.user_loader
def load_user(admin_id):
    """Reload the staff member from the database on each request."""
    with get_cursor(current_app, dictionary=True) as cursor:
        cursor.execute(
            "SELECT AdminID, Username, Role, IsActive FROM admins WHERE AdminID = %s",
            (admin_id,),
        )
        row = cursor.fetchone()
    return AdminUser.from_row(row) if row else None


def _is_safe_next(target):
    """Allow only relative redirects to avoid open-redirect attacks."""
    if not target:
        return False
    host = urlparse(target)
    return not host.netloc and host.path.startswith("/")


@auth_bp.route("/admin/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("admin.dashboard"))

    form = LoginForm()
    if form.validate_on_submit():
        with get_cursor(current_app, dictionary=True) as cursor:
            cursor.execute(
                "SELECT AdminID, Username, Password_Hash, Role, IsActive "
                "FROM admins WHERE Username = %s",
                (form.username.data,),
            )
            row = cursor.fetchone()

        if (
            row
            and row["IsActive"]
            and check_password_hash(row["Password_Hash"], form.password.data)
        ):
            login_user(AdminUser.from_row(row))
            log_action(
                "login",
                "auth",
                entity_id=row["AdminID"],
                details=f"User '{row['Username']}' logged in",
                admin_id=row["AdminID"],
            )
            next_page = request.args.get("next")
            return redirect(next_page if _is_safe_next(next_page) else url_for("admin.dashboard"))

        # Same message for unknown user vs wrong password (no user enumeration).
        flash("Invalid username or password.", "error")
        current_app.logger.info(
            "Failed login attempt for username %r", form.username.data
        )
        log_action(
            "login_failed",
            "auth",
            details=f"Failed login attempt for username '{form.username.data}'",
            admin_id=None,
        )

    return render_template("admin_login.html", form=form)


@auth_bp.route("/admin/logout", methods=["POST"])
@login_required
def logout():
    log_action("logout", "auth", entity_id=current_user.id,
               details=f"User '{current_user.username}' logged out")
    logout_user()
    return redirect(url_for("public.index"))
