"""Activity logging helper — records important staff actions.

Logging is best-effort: a failure to write an audit entry must never break the
action the staff member was performing. Never log passwords, session secrets,
or API keys.
"""

from flask import current_app
from flask_login import current_user

from database import get_cursor


def log_action(action, entity_type, entity_id=None, details=None, admin_id=None):
    """Insert an audit entry into ``activity_logs`` (best effort).

    ``admin_id`` defaults to the current logged-in user. ``entity_id`` is
    stored as text to match the schema. Returns True when the entry was saved.
    """
    if admin_id is None:
        admin_id = getattr(current_user, "id", None)
    try:
        admin_id = int(admin_id) if admin_id is not None else None
    except (TypeError, ValueError):
        admin_id = None

    entity_id = str(entity_id) if entity_id is not None else None

    try:
        with get_cursor(current_app, commit=True) as cursor:
            cursor.execute(
                "INSERT INTO activity_logs "
                "(AdminID, Action, Entity_Type, Entity_ID, Details) "
                "VALUES (%s, %s, %s, %s, %s)",
                (admin_id, action, entity_type, entity_id, details),
            )
        return True
    except Exception as exc:  # noqa: BLE001 - logging must not break the action
        current_app.logger.error("Failed to write activity log (%s): %s", action, exc)
        return False
