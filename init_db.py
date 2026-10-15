#!/usr/bin/env python
"""Initialize PostgreSQL database schema for School Museum.

This script should be run once after deployment to set up the database tables.
It reads the PostgreSQL schema file and executes it.
"""

import os
import sys
import psycopg2
import re

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
        
        # Split statements by semicolon, handling multi-line statements
        statements = []
        current = []
        
        for line in schema_content.split('\n'):
            # Skip comments and empty lines
            if line.strip().startswith('--'):
                continue
            
            current.append(line)
            
            # Check if line ends with semicolon (end of statement)
            if ';' in line:
                statement = '\n'.join(current)
                # Remove everything after the semicolon
                statement = statement.split(';')[0] + ';'
                statement = statement.strip()
                
                if statement and statement != ';':
                    statements.append(statement)
                
                current = []
        
        # Execute each statement
        print(f"Executing {len(statements)} SQL statements...\n")
        for i, statement in enumerate(statements, 1):
            try:
                # Truncate long statements for display
                display_stmt = statement.replace('\n', ' ')
                if len(display_stmt) > 60:
                    display_stmt = display_stmt[:60] + "..."
                
                print(f"[{i}/{len(statements)}] {display_stmt}")
                cursor.execute(statement)
                print(f"  ✓ OK")
                
            except psycopg2.Error as e:
                error_msg = str(e).lower()
                # Some statements may fail if they already exist - this is expected
                if any(x in error_msg for x in ["already exists", "duplicate key", "constraint", "unique violation"]):
                    print(f"  ⊘ Already exists (skipped)")
                else:
                    print(f"  ✗ Warning: {e}")
        
        cursor.close()
        conn.close()
        
        print(f"\n✓ Database initialization complete!")
        return True
        
    except Exception as e:
        print(f"\n✗ Database initialization failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    init_database()
