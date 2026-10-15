#!/bin/bash
#
# School Museum Flask App - Production Deployment Script
# Usage: ./deploy.sh <domain> <admin_username>
# Example: ./deploy.sh museum.example.com admin
#
# This script automates most of the deployment steps.
# Review and customize before running in production.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="${1:?Domain required. Usage: ./deploy.sh domain.com admin_username}"
ADMIN_USER="${2:?Admin username required. Usage: ./deploy.sh domain.com admin_username}"
APP_DIR="/var/www/school-museum"
APP_USER="www-data"
VENV_DIR="$APP_DIR/venv"

echo -e "${YELLOW}=== School Museum Deployment Script ===${NC}"
echo "Domain: $DOMAIN"
echo "Admin User: $ADMIN_USER"
echo "App Directory: $APP_DIR"
echo ""

# Step 1: Create app directory and install dependencies
echo -e "${YELLOW}[1/8] Creating app directory and installing dependencies...${NC}"
sudo mkdir -p "$APP_DIR"
sudo chown -R "$APP_USER:$APP_USER" "$APP_DIR"

cd "$APP_DIR"
python3 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"
pip install --upgrade pip
pip install -r requirements.txt

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 2: Create MySQL database
echo -e "${YELLOW}[2/8] Creating MySQL database...${NC}"
read -sp "MySQL root password: " MYSQL_ROOT_PASS
echo ""

DB_PASS=$(openssl rand -base64 32)
mysql -u root -p"$MYSQL_ROOT_PASS" << EOF
CREATE DATABASE IF NOT EXISTS school_museum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'museum_app'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT SELECT, INSERT, UPDATE, DELETE ON school_museum.* TO 'museum_app'@'localhost';
FLUSH PRIVILEGES;
EOF

mysql -u root -p"$MYSQL_ROOT_PASS" school_museum < school_museum_schema-1.sql

echo -e "${GREEN}✓ Database created${NC}"
echo "Database password: $DB_PASS (save this securely)"

# Step 3: Generate SECRET_KEY
echo -e "${YELLOW}[3/8] Generating SECRET_KEY...${NC}"
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(48))")
echo "SECRET_KEY: $SECRET_KEY"

# Step 4: Create .env file
echo -e "${YELLOW}[4/8] Creating .env file...${NC}"
cat > "$APP_DIR/.env" << EOF
APP_ENV=production

SECRET_KEY=$SECRET_KEY

DB_HOST=localhost
DB_PORT=3306
DB_USER=museum_app
DB_PASSWORD=$DB_PASS
DB_NAME=school_museum

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SITE_URL=https://$DOMAIN
SESSION_COOKIE_SECURE=1
SESSION_COOKIE_HTTPONLY=1

HOST=127.0.0.1
PORT=8000
EOF

chmod 600 "$APP_DIR/.env"
echo -e "${GREEN}✓ .env file created (permissions: 600)${NC}"

# Step 5: Create admin account
echo -e "${YELLOW}[5/8] Creating administrator account...${NC}"
source "$VENV_DIR/bin/activate"
python3 "$APP_DIR/create_admin.py" "$ADMIN_USER" --role admin
echo -e "${GREEN}✓ Admin account created${NC}"

# Step 6: Set up systemd service
echo -e "${YELLOW}[6/8] Setting up systemd service...${NC}"
sudo tee /etc/systemd/system/school-museum.service > /dev/null << EOF
[Unit]
Description=School Museum Flask App
After=network.target

[Service]
Type=notify
User=$APP_USER
WorkingDirectory=$APP_DIR
EnvironmentFile=$APP_DIR/.env
ExecStart=$VENV_DIR/bin/python $APP_DIR/wsgi.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable school-museum
echo -e "${GREEN}✓ Systemd service configured${NC}"

# Step 7: Configure Nginx
echo -e "${YELLOW}[7/8] Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/school-museum > /dev/null << 'EOF_NGINX'
upstream museum_app {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name %DOMAIN%;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name %DOMAIN%;

    ssl_certificate /etc/letsencrypt/live/%DOMAIN%/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/%DOMAIN%/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/school-museum-access.log;
    error_log /var/log/nginx/school-museum-error.log;

    client_max_body_size 12m;

    location / {
        proxy_pass http://museum_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    location /static/ {
        alias /var/www/school-museum/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
}
EOF_NGINX

# Replace domain placeholder
sed -i "s/%DOMAIN%/$DOMAIN/g" /etc/nginx/sites-available/school-museum

sudo ln -sf /etc/nginx/sites-available/school-museum /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo -e "${GREEN}✓ Nginx configured${NC}"

# Step 8: Set up SSL (Let's Encrypt)
echo -e "${YELLOW}[8/8] Setting up SSL certificate (Let's Encrypt)...${NC}"
if command -v certbot &> /dev/null; then
    sudo certbot certonly --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m admin@"$DOMAIN"
    sudo systemctl enable certbot.timer
    sudo systemctl start certbot.timer
    echo -e "${GREEN}✓ SSL certificate installed and auto-renewal enabled${NC}"
else
    echo -e "${YELLOW}⚠ Certbot not found. Please install manually:${NC}"
    echo "   sudo apt-get install certbot python3-certbot-nginx"
    echo "   sudo certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN"
fi

echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo "Next steps:"
echo "1. Update .env file with Cloudinary credentials:"
echo "   nano $APP_DIR/.env"
echo ""
echo "2. Start the application:"
echo "   sudo systemctl start school-museum"
echo ""
echo "3. Check status:"
echo "   sudo systemctl status school-museum"
echo ""
echo "4. Verify installation:"
echo "   curl https://$DOMAIN/health"
echo ""
echo "5. Open in browser:"
echo "   https://$DOMAIN/"
echo ""
echo "6. Login at: https://$DOMAIN/admin/login"
echo "   Username: $ADMIN_USER"
echo ""
echo -e "${YELLOW}Important: Keep the following safe:${NC}"
echo "- .env file (contains SECRET_KEY, DB_PASSWORD)"
echo "- Database password: $DB_PASS"
