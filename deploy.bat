@echo off
REM School Museum Flask App - Windows Deployment Script
REM Usage: deploy.bat <domain>
REM Example: deploy.bat museum.example.com

setlocal enabledelayedexpansion

if "%~1"=="" (
    echo Usage: deploy.bat ^<domain^>
    echo Example: deploy.bat museum.example.com
    exit /b 1
)

set DOMAIN=%~1
set APP_DIR=%cd%

echo.
echo === School Museum Windows Deployment ===
echo Domain: %DOMAIN%
echo App Directory: %APP_DIR%
echo.

REM Step 1: Create virtual environment
echo [1/5] Creating Python virtual environment...
python -m venv venv
call venv\Scripts\activate.bat

REM Step 2: Install dependencies
echo [2/5] Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Step 3: Create .env file
echo [3/5] Creating .env file...

REM Generate SECRET_KEY
for /f "delims=" %%A in ('python -c "import secrets; print(secrets.token_urlsafe(48))"') do set SECRET_KEY=%%A

(
echo APP_ENV=production
echo.
echo SECRET_KEY=%SECRET_KEY%
echo.
echo DB_HOST=localhost
echo DB_PORT=3306
echo DB_USER=museum_app
echo DB_PASSWORD=CHANGE_ME_IN_PRODUCTION
echo DB_NAME=school_museum
echo.
echo CLOUDINARY_CLOUD_NAME=
echo CLOUDINARY_API_KEY=
echo CLOUDINARY_API_SECRET=
echo.
echo SITE_URL=https://%DOMAIN%
echo SESSION_COOKIE_SECURE=1
echo SESSION_COOKIE_HTTPONLY=1
echo.
echo HOST=0.0.0.0
echo PORT=8000
) > .env

echo .env file created. IMPORTANT: Update with actual values:
echo - DB_PASSWORD
echo - CLOUDINARY_* credentials

REM Step 4: Create admin user
echo.
echo [4/5] Creating administrator account...
python create_admin.py admin --role admin

REM Step 5: Instructions
echo.
echo [5/5] Deployment setup complete!
echo.
echo === NEXT STEPS ===
echo.
echo 1. Edit .env file with production values:
echo    - DB_PASSWORD
echo    - Cloudinary credentials
echo.
echo 2. Create MySQL database:
echo    mysql -u root -p school_museum ^< school_museum_schema-1.sql
echo.
echo 3. Run production server:
echo    python wsgi.py
echo.
echo 4. For automated startup, use Task Scheduler or NSSM:
echo    nssm install SchoolMuseum "C:\path\to\venv\Scripts\python.exe" "C:\path\to\wsgi.py"
echo    nssm start SchoolMuseum
echo.
echo 5. Set up IIS/nginx reverse proxy pointing to http://127.0.0.1:8000
echo.
echo 6. Access at: https://%DOMAIN%
echo    Login: https://%DOMAIN%/admin/login
echo.
echo === SECURITY REMINDERS ===
echo - Keep .env file secure (contains SECRET_KEY, passwords)
echo - Set up HTTPS with SSL certificate
echo - Use a production-grade reverse proxy (nginx/IIS)
echo - Never commit .env to version control
echo - Set up regular database backups
echo.
pause
