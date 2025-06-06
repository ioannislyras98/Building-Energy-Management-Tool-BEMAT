@echo off
echo ====================================
echo   Quick Frontend Dependencies Fix
echo ====================================
echo.
echo This script fixes the "universal-cookie" import error
echo and other dependency issues that occur after cloning.
echo.

cd /d "%~dp0"

if not exist "frontend" (
    echo ERROR: This script must be run from the project root directory.
    pause
    exit /b 1
)

echo [1/4] Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found! Please install Node.js 18+
    pause
    exit /b 1
)

echo [2/4] Cleaning dependencies...
cd frontend

if exist "node_modules" (
    echo Removing node_modules...
    rmdir /s /q "node_modules"
)

echo [3/4] Fresh dependency installation...
npm cache clean --force
npm install --legacy-peer-deps

if errorlevel 1 (
    echo Installation failed, trying alternative method...
    npm install --force
    if errorlevel 1 (
        echo ERROR: Could not install dependencies!
        echo Try running manually: cd frontend && npm install
        pause
        exit /b 1
    )
)

echo [4/4] Verifying universal-cookie...
if exist "node_modules\universal-cookie\package.json" (
    echo ✓ universal-cookie is properly installed
) else (
    echo Installing universal-cookie explicitly...
    npm install universal-cookie@^7.2.2 --save --legacy-peer-deps
)

cd ..

echo.
echo ====================================
echo   Dependencies fixed successfully!
echo ====================================
echo.
echo You can now run the frontend with:
echo   cd frontend && npm run dev
echo Or with Docker:
echo   docker-compose -f frontend\docker-compose.frontend.yml up
echo.
pause
