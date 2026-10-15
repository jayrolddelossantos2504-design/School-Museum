"""Reusable MySQL helpers.

Every function opens a connection, uses it, and closes it safely. Taking the
Flask app as an argument (instead of importing a global) keeps the helpers
testable and avoids circular imports.
"""

from contextlib import contextmanager

import mysql.connector


def get_connection(app):
    """Open a new MySQL connection using the app's configuration."""
    return mysql.connector.connect(
        host=app.config["DB_HOST"],
        port=app.config["DB_PORT"],
        user=app.config["DB_USER"],
        password=app.config["DB_PASSWORD"],
        database=app.config["DB_NAME"],
    )


@contextmanager
def get_cursor(app, dictionary=False, commit=False):
    """Yield a cursor and always close the cursor and connection.

    On any exception the transaction is rolled back before re-raising, so
    callers never leave a half-written change behind.
    """
    connection = get_connection(app)
    cursor = connection.cursor(dictionary=dictionary)
    try:
        yield cursor
        if commit:
            connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        cursor.close()
        connection.close()
