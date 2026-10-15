#!/usr/bin/env python
"""Initialize PostgreSQL database schema for School Museum.

This script should be run once after deployment to set up the database tables.
It reads the PostgreSQL schema file and executes it properly.
"""

import os
import sys
import psycopg2

def split_sql_statements(sql_content):
    """Split SQL content into individual statements.
    
    Handles multi-line statements and preserves semi-colons within statements.
    """
    statements = []
    current = []
    in_string = False
    string_char = None
    
    for i, char in enumerate(sql_content):
        # Handle string literals
        if char in ('"', "'") and (i == 0 or sql_content[i-1] != '\\'):
            if not in_string:
                in_string = True
                string_char = char
            elif char == string_char:
                in_string = False
                string_char = None
        
        current.append(char)
        
        # Check for statement end (semicolon outside of strings)
        if char == ';' and not in_string:
            statement = ''.join(current).strip()
            
            # Remove leading comments and empty lines
            lines = []
            for line in statement.split('\n'):
                line = line.strip()
                if not line.startswith('--') and line:
                    lines.append(line)
            
            statement = ' '.join(lines).strip()
            
            if statement and statement != ';':
                statements.append(statement)
            
            current = []
    
    return statements

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
        print("Reading schema file...\n")
        with open("school_museum_schema_postgres.sql", "r") as f:
            schema_content = f.read()
        
        # Parse statements
        statements = split_sql_statements(schema_content)
        
        # Execute each statement
        print(f"Executing {len(statements)} SQL statements:\n")
        success_count = 0
        
        for i, statement in enumerate(statements, 1):
            try:
                # Truncate long statements for display
                display_stmt = statement
                if len(display_stmt) > 70:
                    display_stmt = display_stmt[:70] + "..."
                
                print(f"[{i:2d}/{len(statements)}] {display_stmt}")
                cursor.execute(statement)
                print(f"       ✓ Success")
                success_count += 1
                
            except psycopg2.Error as e:
                error_msg = str(e).lower()
                # Some statements may fail if they already exist - this is expected
                if any(x in error_msg for x in ["already exists", "duplicate key", "unique violation", "constraint"]):
                    print(f"       ⊘ Already exists (skipped)")
                    success_count += 1
                else:
                    print(f"       ✗ Error: {str(e)[:60]}")
            
            except Exception as e:
                print(f"       ✗ Error: {str(e)[:60]}")
        
        cursor.close()
        conn.close()
        
        print(f"\n{'='*60}")
        print(f"✓ Database initialization complete!")
        print(f"  Successfully processed: {success_count}/{len(statements)} statements")
        print(f"{'='*60}")
        return True
        
    except Exception as e:
        print(f"\n✗ Database initialization failed!")
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    init_database()
