@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title School Museum Installer

echo ============================================================
echo   School Museum - Installer
echo ============================================================
echo.

set "PY="
where py >nul 2>&1
if not errorlevel 1 set "PY=py -3"
if not defined PY (
    where python >nul 2>&1
    if not errorlevel 1 set "PY=python"
)
if not defined PY (
    echo ERROR: Python was not found.
    echo Install Python 3.9-3.12 from https://www.python.org/downloads/
    echo IMPORTANT: tick "Add python.exe to PATH" during installation.
    echo.
    pause
    exit /b 1
)

echo [1/5] Python found:
%PY% --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python could not be started.
    echo Reinstall Python 3.9-3.12 and tick "Add python.exe to PATH".
    echo.
    pause
    exit /b 1
)
%PY% --version
echo.

if not exist "venv\Scripts\python.exe" (
    echo [2/5] Creating virtual environment...
    %PY% -m venv venv
    if errorlevel 1 goto :fail
) else (
    echo [2/5] Virtual environment already exists.
)
echo.

echo [3/5] Installing Python packages...
"venv\Scripts\python.exe" -m pip install --upgrade pip
"venv\Scripts\python.exe" -m pip install -r requirements.txt
if errorlevel 1 goto :fail
echo.

echo [4/5] Preparing configuration...
set "NEWENV=0"
set "NEEDENV=0"
if not exist ".env" (
    copy /Y ".env.example" ".env" >nul
    set "NEWENV=1"
    echo Created .env from .env.example
)
if not exist "logs" mkdir "logs"
if not exist "uploads" mkdir "uploads"

findstr /B /C:"DB_USER=replace-me" ".env" >nul 2>&1
if not errorlevel 1 set "NEEDENV=1"
findstr /B /C:"DB_PASSWORD=replace-me" ".env" >nul 2>&1
if not errorlevel 1 set "NEEDENV=1"
findstr /B /C:"SECRET_KEY=replace-with-a-long-random-secret" ".env" >nul 2>&1
if not errorlevel 1 set "NEEDENV=1"
if "%NEWENV%"=="1" set "NEEDENV=1"

if "%NEEDENV%"=="1" (
    echo.
    echo ------------------------------------------------------------
    echo  ACTION REQUIRED: fill in your database settings.
    echo  A fresh XAMPP install usually uses:
    echo      DB_USER=root
    echo      DB_PASSWORD=      ^(leave blank^)
    echo  Replace SECRET_KEY with any long random text.
    echo  Save the file, close Notepad, then return here.
    echo ------------------------------------------------------------
    start /wait notepad ".env"
)
echo.

echo [5/5] Creating database tables...
"venv\Scripts\python.exe" init_db.py
if errorlevel 1 (
    echo.
    echo Database setup failed. Check DB_HOST/DB_PORT/DB_USER/DB_PASSWORD
    echo in .env and make sure MySQL is running, then run:
    echo     venv\Scripts\python.exe init_db.py
    echo.
    pause
    exit /b 1
)
echo.

choice /C YN /M "Create the first staff account now"
if errorlevel 2 goto :skip_admin
"venv\Scripts\python.exe" create_admin.py admin --role admin

:skip_admin
echo.
echo ============================================================
echo   Installation complete.
echo.
echo   Start the site with:
echo       venv\Scripts\python.exe wsgi.py
echo.
echo   Then open:
echo       http://127.0.0.1:8000
echo       http://127.0.0.1:8000/admin/login
echo.
echo   Optional temporary public link (needs cloudflared):
echo       start.bat
echo ============================================================
echo.
choice /C YN /M "Start the site now"
if errorlevel 2 goto :end
"venv\Scripts\python.exe" wsgi.py
goto :end

:fail
echo.
echo Installation failed. Read the error above.
pause
exit /b 1

:end
endlocal
