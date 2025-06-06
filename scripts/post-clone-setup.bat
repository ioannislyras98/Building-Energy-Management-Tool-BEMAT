@echo off
REM BEMAT - Post-Clone Setup Script
REM Run this immediately after cloning to prevent frontend issues

echo ====================================
echo   BEMAT - Post-Clone Setup
echo ====================================
echo.
echo This script configures your local environment to prevent
echo frontend build issues that commonly occur after cloning.
echo.

echo [1/4] Configuring Git for optimal performance...
git config core.autocrlf false
git config core.eol lf
git config core.filemode false
echo ✓ Git configuration optimized

echo [2/4] Checking Docker Desktop...
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Desktop is not running
    echo Please start Docker Desktop and run this script again
    pause
    exit /b 1
) else (
    echo ✓ Docker Desktop is running
)

echo [3/4] Validating frontend dependencies...
if exist "frontend\package.json" (
    echo ✓ Frontend package.json found
) else (
    echo ❌ Frontend package.json missing
    echo Repository may be corrupted
    pause
    exit /b 1
)

echo [4/4] Creating necessary directories and permissions...
if not exist "frontend\node_modules" (
    mkdir "frontend\node_modules" 2>nul
)

echo.
echo ====================================
echo   Setup completed successfully!
echo ====================================
echo.
echo Your environment is now configured to prevent common
echo frontend issues that occur after cloning.
echo.
echo Next steps:
echo   1. Run 'start-bemat.bat' to start the application
echo   2. If you encounter issues, run 'fix-frontend-clone-issues.bat'
echo.
echo This setup only needs to be run once per clone.
echo.
pause
