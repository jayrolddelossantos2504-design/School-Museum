#!/bin/bash
# Build script for Render.com deployment
# Runs database migrations and builds assets

set -e

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Initializing PostgreSQL database..."
python -c "
import os
import psycopg2
from psycopg2 import sql

database_url = os.environ.get('DATABASE_URL')
if database_url:
    conn = psycopg2.connect(database_url)
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Read and execute schema
    with open('school_museum_schema_postgres.sql', 'r') as f:
        schema = f.read()
    
    # Split by semicolons and execute each statement
    statements = [s.strip() for s in schema.split(';') if s.strip() and not s.strip().startswith('--')]
    for stmt in statements:
        try:
            cursor.execute(stmt)
        except psycopg2.Error as e:
            print(f'Warning: {e}')
    
    cursor.close()
    conn.close()
    print('Database initialized successfully!')
else:
    print('DATABASE_URL not set, skipping database initialization')
"

echo "Build complete!"
