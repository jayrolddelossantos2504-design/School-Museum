#!/usr/bin/env python
"""Create admin account directly in Render.com database.

Run this ONCE to set up your first admin account:
    DATABASE_URL="postgresql://..." python create_admin_direct.py
"""

import os
import psycopg2
from werkzeug.security import generate_password_hash

def main():
    database_url = os.environ.get("DATABASE_URL")
    
    if not database_url:
        print("ERROR: DATABASE_URL environment variable is not set!")
        print("\nUsage:")
        print('  set DATABASE_URL="postgresql://user:pass@host:port/dbname"')
        print("  python create_admin_direct.py")
        return
    
    username = "MuseumAdmin"
    password = "MuseumAdmin123"
    role = "admin"
    
    try:
        print(f"Connecting to database...")
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT AdminID FROM admins WHERE Username = %s", (username,))
        if cursor.fetchone():
            print(f"✗ User '{username}' already exists!")
            cursor.close()
            conn.close()
            return
        
        # Create password hash
        password_hash = generate_password_hash(password)
        
        # Insert admin
        cursor.execute(
            "INSERT INTO admins (Username, Password_Hash, Role, IsActive) "
            "VALUES (%s, %s, %s, TRUE)",
            (username, password_hash, role),
        )
        
        cursor.close()
        conn.close()
        
        print(f"✓ SUCCESS! Created admin account")
        print(f"  Username: {username}")
        print(f"  Password: {password}")
        print(f"  Role: {role}")
        print(f"\nYou can now log in at: https://school-museum-1.onrender.com/login")
        
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == "__main__":
    main()
