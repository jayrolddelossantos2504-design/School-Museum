#!/usr/bin/env python
"""Initialize PostgreSQL database schema for School Museum.

This script should be run once after deployment to set up the database tables.
It reads the PostgreSQL schema file and executes it.
"""

import os
import sys
import psycopg2

def init_database():
    """Initialize the database with schema."""
    database_url = os.environ.get("DATABASE_URL")
    
    if not database_url:
        print("ERROR: DATABASE_URL environment variable not set")
        sys.exit(1)
    
    try:
        print("Connecting to PostgreSQL database...")
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Read the schema file
        print("Reading schema file...")
        with open("school_museum_schema_postgres.sql", "r") as f:
            schema_content = f.read()
        
        # Split statements by semicolon (handle multi-line statements)
        statements = []
        current_statement = []
        
        for line in schema_content.split('\n'):
            # Skip comments and empty lines
            if line.strip().startswith('--') or not line.strip():
                continue
            
            current_statement.append(line)
            
            if line.strip().endswith(';'):
                statement = '\n'.join(current_statement).strip()
                if statement:
                    statements.append(statement)
                current_statement = []
        
        # Execute each statement
        print(f"Executing {len(statements)} SQL statements...")
        for i, statement in enumerate(statements, 1):
            try:
                print(f"  [{i}/{len(statements)}] Executing: {statement[:60]}...")
                cursor.execute(statement)
                print(f"    ✓ OK")
            except psycopg2.Error as e:
                # Some statements may fail if they already exist (CREATE IF NOT EXISTS)
                # This is expected and not an error
                if "already exists" in str(e) or "duplicate key" in str(e):
                    print(f"    ⊘ Already exists (skipped)")
                else:
                    print(f"    ✗ Warning: {e}")
        
        cursor.close()
        conn.close()
        
        print("\n✓ Database initialization complete!")
        return True
        
    except Exception as e:
        print(f"\n✗ Database initialization failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_database()
