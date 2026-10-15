#!/usr/bin/env python
"""Quick setup script to create admin account without interactive prompts."""

import os
import sys
import psycopg2
from werkzeug.security import generate_password_hash

def create_admin_account(username, password, role="admin"):
    """Create an admin account directly using DATABASE_URL."""
    database_url = os.environ.get("DATABASE_URL")
    
    if not database_url:
        print("ERROR: DATABASE_URL not set. Cannot connect to remote database.")
        print("Set DATABASE_URL environment variable to your Render.com PostgreSQL URL.")
        return False
    
    try:
        print(f"Connecting to database...")
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # Check if username already exists
        cursor.execute("SELECT AdminID FROM admins WHERE Username = %s", (username,))
        if cursor.fetchone():
            print(f"Error: username '{username}' already exists.")
            cursor.close()
            conn.close()
            return False
        
        # Hash the password and insert
        password_hash = generate_password_hash(password)
        
        cursor.execute(
            "INSERT INTO admins (Username, Password_Hash, Role, IsActive) "
            "VALUES (%s, %s, %s, TRUE)",
            (username, password_hash, role),
        )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✓ Created admin account '{username}' with role '{role}'")
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    # Create MuseumAdmin account
    create_admin_account("MuseumAdmin", "MuseumAdmin123", "admin")
