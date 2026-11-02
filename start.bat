@echo off
setlocal
cd /d "%~dp0"
title School Museum Launcher
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
if errorlevel 1 pause
endlocal
