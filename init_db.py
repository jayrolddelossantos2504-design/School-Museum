"""Create the School Museum database, tables, and starter categories.

Reads connection settings from .env (the same variables the app uses).
Safe to run more than once: the schema uses IF NOT EXISTS / INSERT IGNORE.

Usage:
    venv\\Scripts\\python.exe init_db.py
    venv\\Scripts\\python.exe init_db.py --dry-run
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

SCHEMA_FILE = Path(__file__).with_name("school_museum_schema-1.sql")


def split_statements(script: str) -> list[str]:
    """Split a SQL script on semicolons, ignoring comments and quoted text."""
    statements: list[str] = []
    buffer: list[str] = []
    in_single = False
    in_double = False
    i = 0

    while i < len(script):
        char = script[i]

        if (
            not in_single
            and not in_double
            and char == "-"
            and i + 1 < len(script)
            and script[i + 1] == "-"
        ):
            newline = script.find("\n", i)
            if newline == -1:
                break
            i = newline + 1
            continue

        if char == "'" and not in_double:
            if in_single and i + 1 < len(script) and script[i + 1] == "'":
                buffer.append("''")
                i += 2
                continue
            in_single = not in_single
        elif char == '"' and not in_single:
            in_double = not in_double
        elif char == ";" and not in_single and not in_double:
            statement = "".join(buffer).strip()
            if statement:
                statements.append(statement)
            buffer = []
            i += 1
            continue

        buffer.append(char)
        i += 1

    tail = "".join(buffer).strip()
    if tail:
        statements.append(tail)
    return statements


def report_connection_error(exc, host: str, port: int) -> int:
    code = getattr(exc, "errno", None)
    print(f"ERROR: could not connect to MySQL ({exc}).")
    if code == 1045:
        print("Fix DB_USER / DB_PASSWORD in .env.")
        print("XAMPP default: DB_USER=root, DB_PASSWORD= (blank).")
    elif code == 2003:
        print(f"Start MySQL (XAMPP Control Panel) and check DB_HOST={host}, DB_PORT={port}.")
    else:
        print("Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in .env.")
    return 1


def report_schema_error(exc) -> int:
    code = getattr(exc, "errno", None)
    print(f"ERROR while applying the schema: {exc}")
    if code in (1044, 1142):
        print("The database user lacks CREATE privileges.")
        print("Use a user with CREATE rights (XAMPP default root), or import")
        print("school_museum_schema-1.sql with phpMyAdmin/root, then re-run init_db.py.")
    return 1


def main() -> int:
    dry_run = "--dry-run" in sys.argv[1:]
    load_dotenv()

    if not SCHEMA_FILE.exists():
        print(f"ERROR: schema file not found: {SCHEMA_FILE}")
        return 1

    statements = split_statements(SCHEMA_FILE.read_text(encoding="utf-8"))
    if not statements:
        print("ERROR: no SQL statements found in the schema file.")
        return 1

    if dry_run:
        print(f"Dry run: parsed {len(statements)} SQL statement(s).")
        return 0

    try:
        import mysql.connector
    except ImportError:
        print("ERROR: mysql-connector-python is not installed.")
        print("Run: venv\\Scripts\\python.exe -m pip install -r requirements.txt")
        return 1

    host = os.environ.get("DB_HOST", "localhost")
    port = int(os.environ.get("DB_PORT", "3306"))
    user = os.environ.get("DB_USER", "")
    password = os.environ.get("DB_PASSWORD", "")
    name = os.environ.get("DB_NAME", "school_museum")

    print(f"Connecting to MySQL at {host}:{port} as {user or '(blank user)'}...")
    try:
        connection = mysql.connector.connect(
            host=host, port=port, user=user, password=password
        )
    except mysql.connector.Error as exc:
        return report_connection_error(exc, host, port)

    try:
        cursor = connection.cursor()
        for statement in statements:
            cursor.execute(statement)
        connection.commit()
        cursor.close()
    except mysql.connector.Error as exc:
        return report_schema_error(exc)
    finally:
        connection.close()

    print(f"Done. Database '{name}' is ready.")
    print("Starter categories were added if they were missing.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
