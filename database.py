"""Reusable PostgreSQL helpers.

Every function opens a connection, uses it, and closes it safely. Taking the
Flask app as an argument (instead of importing a global) keeps the helpers
testable and avoids circular imports.
"""

from contextlib import contextmanager
import os

import psycopg2


def get_connection(app):
    """Open a new PostgreSQL connection using the app's configuration.
    
    Supports both traditional config variables and DATABASE_URL format.
    """
    # Check if DATABASE_URL is set (Render.com format)
    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        return psycopg2.connect(database_url)
    
    # Fall back to individual config variables (local development)
    return psycopg2.connect(
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
