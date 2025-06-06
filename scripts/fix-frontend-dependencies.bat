@echo off
echo ====================================
echo Frontend Troubleshooting & Fix Script
echo ====================================
echo.

cd /d "%~dp0"

if not exist "frontend" (
    echo ERROR: frontend directory not found!
    echo This script must be run from the project root directory.
    pause
    exit /b 1
)

echo [1/6] Checking Node.js version...
node --version > nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH!
    echo Please install Node.js version 18 or higher.
    pause
    exit /b 1
)

echo [2/6] Cleaning frontend dependencies...
cd frontend

REM Remove node_modules and package-lock.json to force clean install
if exist "node_modules" (
    echo Removing node_modules directory...
    rmdir /s /q "node_modules"
)

if exist "package-lock.json" (
    echo Removing package-lock.json...
    del "package-lock.json"
)

echo [3/6] Clearing npm cache...
npm cache clean --force

echo [4/6] Installing dependencies with clean install...
npm ci --no-optional --legacy-peer-deps

REM If npm ci fails, try regular install
if errorlevel 1 (
    echo npm ci failed, trying npm install...
    npm install --legacy-peer-deps
    
    if errorlevel 1 (
        echo ERROR: npm install failed!
        echo Try running this manually:
        echo   cd frontend
        echo   npm install --legacy-peer-deps
        pause
        exit /b 1
    )
)

echo [5/6] Verifying universal-cookie installation...
if not exist "node_modules\universal-cookie\package.json" (
    echo WARNING: universal-cookie not found, installing explicitly...
    npm install universal-cookie@^7.2.2 --save
)

echo [6/6] Running development build test...
npm run build > build-test.log 2>&1
if errorlevel 1 (
    echo WARNING: Build test failed. Check build-test.log for details.
    echo This might indicate configuration issues.
) else (
    echo Build test passed!
    if exist "build-test.log" del "build-test.log"
)

cd ..

echo.
echo ====================================
echo Frontend fix completed successfully!
echo ====================================
echo.
echo You can now run: docker-compose -f frontend\docker-compose.frontend.yml up
echo Or for development: cd frontend && npm run dev
echo.
pause
