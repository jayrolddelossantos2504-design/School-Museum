"""Create a School Museum staff account (first administrator setup).

Usage:
    python create_admin.py <username> --role admin
    python create_admin.py <username> --role editor

The password is prompted for interactively (never passed on the command line,
so it never lands in shell history or process lists). It is hashed with
Werkzeug before being stored — plain-text passwords are never written.

This script deliberately does not ship any default account or password.
"""

import argparse
import getpass
import sys

from werkzeug.security import generate_password_hash

from app import create_app
from config import get_config
from database import get_cursor

MIN_PASSWORD_LENGTH = 8


def parse_args():
    parser = argparse.ArgumentParser(description="Create a School Museum staff account.")
    parser.add_argument("username", help="Login username (max 100 characters)")
    parser.add_argument(
        "--role",
        choices=["admin", "editor"],
        default="admin",
        help="Staff role (default: admin)",
    )
    return parser.parse_args()


def create_account(username, role, password):
    app = create_app(get_config())

    # Refuse to overwrite an existing username.
    with get_cursor(app, dictionary=True) as cursor:
        cursor.execute("SELECT AdminID FROM admins WHERE Username = %s", (username,))
        if cursor.fetchone():
            sys.exit(f"Error: username '{username}' already exists.")

    # Hash before insert; never store plain text.
    password_hash = generate_password_hash(password)

    with get_cursor(app, commit=True) as cursor:
        cursor.execute(
            "INSERT INTO admins (Username, Password_Hash, Role, IsActive) "
            "VALUES (%s, %s, %s, TRUE)",
            (username, password_hash, role),
        )

    print(f"Created staff account '{username}' with role '{role}'.")


def main():
    args = parse_args()

    username = args.username.strip()
    if not username:
        sys.exit("Error: username must not be empty.")
    if len(username) > 100:
        sys.exit("Error: username must be 100 characters or fewer.")

    password = getpass.getpass("Password: ")
    confirm = getpass.getpass("Confirm password: ")

    if password != confirm:
        sys.exit("Error: passwords do not match.")
    if len(password) < MIN_PASSWORD_LENGTH:
        sys.exit(f"Error: password must be at least {MIN_PASSWORD_LENGTH} characters.")

    create_account(username, args.role, password)


if __name__ == "__main__":
    main()
