@echo off
echo Starting ASCENT XR Dashboard Server...
echo.

REM Check if Python is available
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Python not found. Installing Python...
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if port 8087 is available
netstat -an | findstr :8087 >nul
if %errorlevel% equ 0 (
    echo Port 8087 is already in use!
    echo Killing existing process...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8087') do (
        taskkill /F /PID %%a
    )
    timeout /t 2 /nobreak >nul
)

REM Change to directory containing dashboard
cd /d "%~dp0"

REM Start HTTP server
echo Starting HTTP server on port 8087...
echo Dashboard available at: http://localhost:8087/ascent_xr_dashboard.html
echo For network access: http://%COMPUTERNAME%:8087/ascent_xr_dashboard.html
echo.
python -m http.server 8087 --bind 0.0.0.0