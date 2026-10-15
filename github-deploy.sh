#!/bin/bash
#
# School Museum - GitHub & Render Deployment Script
# This script automates pushing to GitHub and deploying to Render.com
#
# Usage: ./github-deploy.sh <github-repo-url>
# Example: ./github-deploy.sh https://github.com/username/school-museum.git

set -e

REPO_URL="${1:?GitHub repo URL required. Usage: ./github-deploy.sh https://github.com/user/repo.git}"

echo ""
echo "=== School Museum GitHub Deployment Setup ==="
echo ""
echo "Repository: $REPO_URL"
echo ""

# Step 1: Initialize git
echo "[1/6] Initializing git repository..."
if [ ! -d .git ]; then
    git init
    git branch -M main
    git remote add origin "$REPO_URL"
    echo "✓ Git initialized"
else
    echo "✓ Git already initialized"
fi

# Step 2: Configure git
echo "[2/6] Configuring git..."
read -p "Enter your name: " GIT_NAME
read -p "Enter your email: " GIT_EMAIL
git config user.name "$GIT_NAME"
git config user.email "$GIT_EMAIL"
echo "✓ Git configured"

# Step 3: Create .gitignore
echo "[3/6] Setting up .gitignore..."
if [ ! -f .gitignore ]; then
    cat > .gitignore << 'EOF'
.env
.env.local
__pycache__/
*.pyc
venv/
node_modules/
logs/
*.log
.DS_Store
.vscode/
.idea/
EOF
    echo "✓ .gitignore created"
else
    echo "✓ .gitignore already exists"
fi

# Step 4: Add and commit files
echo "[4/6] Adding files to git..."
git add .
echo "Commit message (e.g., 'Initial commit: School Museum Flask app'): "
read -p "> " COMMIT_MSG
git commit -m "$COMMIT_MSG" || echo "✓ Nothing to commit"

# Step 5: Push to GitHub
echo "[5/6] Pushing to GitHub..."
git push -u origin main
echo "✓ Pushed to GitHub"

# Step 6: Instructions
echo ""
echo "[6/6] Setting up Render.com deployment..."
echo ""
echo "=== NEXT STEPS ==="
echo ""
echo "1. Go to https://render.com"
echo "2. Sign in with GitHub"
echo "3. Create New → Web Service"
echo "4. Select your 'school-museum' repository"
echo "5. Configure:"
echo "   - Name: school-museum"
echo "   - Environment: Python 3"
echo "   - Build Command: pip install -r requirements.txt && npm install --legacy-peer-deps && npx tailwindcss -i ./static/css/tailwind-source.css -o ./static/css/tailwind.css"
echo "   - Start Command: python wsgi.py"
echo "   - Instance Type: Free"
echo ""
echo "6. Add Environment Variables:"
echo "   APP_ENV=production"
echo "   SECRET_KEY=<generate new>"
echo "   DB_HOST=<database-host>"
echo "   DB_USER=<database-user>"
echo "   DB_PASSWORD=<password>"
echo "   CLOUDINARY_CLOUD_NAME=<cloud>"
echo "   CLOUDINARY_API_KEY=<key>"
echo "   CLOUDINARY_API_SECRET=<secret>"
echo "   SITE_URL=https://your-render-url.onrender.com"
echo ""
echo "7. Add PostgreSQL Database to Render project"
echo ""
echo "8. Import database schema:"
echo "   psql <connection-string> < school_museum_schema-1.sql"
echo ""
echo "9. Deployment starts automatically!"
echo ""
echo "Repository: https://github.com/$GIT_NAME/school-museum"
echo ""
echo "✓ Setup complete!"
