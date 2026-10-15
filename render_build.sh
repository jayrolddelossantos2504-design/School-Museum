#!/bin/bash
# Build script for Render.com deployment
# Runs database migrations and builds assets

set -e

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Initializing PostgreSQL database..."
python init_db.py

echo "Build complete!"
