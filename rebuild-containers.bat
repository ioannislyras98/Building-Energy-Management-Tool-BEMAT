@echo off
echo ====================================
echo   BEMAT - Rebuild & Update Dependencies
echo ====================================
echo.
echo This script will:
echo 1. Stop all containers
echo 2. Remove old images to force rebuild
echo 3. Rebuild containers with latest dependencies
echo 4. Start all services
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

REM Check Docker
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker Desktop is not running!
    pause
    exit /b 1
)

echo [1/6] Stopping all containers...
cd /d "%~dp0backend"
docker-compose down
cd /d "%~dp0frontend"
docker-compose -f docker-compose.frontend.yml down

echo [2/6] Removing old images to force rebuild...
for /f %%i in ('docker images -q backend*') do docker rmi %%i 2>nul
for /f %%i in ('docker images -q frontend*') do docker rmi %%i 2>nul

echo [3/6] Cleaning up unused Docker resources...
docker system prune -f

echo [4/6] Rebuilding Backend (Django + PostgreSQL)...
cd /d "%~dp0backend"
docker-compose build --no-cache
if errorlevel 1 (
    echo ERROR: Backend build failed!
    pause
    exit /b 1
)

echo [5/6] Rebuilding Frontend (React + Dependencies)...
cd /d "%~dp0frontend"
docker-compose -f docker-compose.frontend.yml build --no-cache
if errorlevel 1 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)

echo [6/6] Starting all services...
cd /d "%~dp0backend"
start "BEMAT Backend" cmd /k "docker-compose up"

timeout /t 10 /nobreak > nul

cd /d "%~dp0frontend"
start "BEMAT Frontend" cmd /k "docker-compose -f docker-compose.frontend.yml up"

echo.
echo ====================================
echo   Rebuild Complete!
echo ====================================
echo.
echo All containers rebuilt with latest dependencies.
echo Services are starting in separate terminal windows.
echo.
echo Waiting 30 seconds before opening browsers...
timeout /t 30 /nobreak > nul

start http://localhost:3000
timeout /t 2 /nobreak > nul
start http://localhost:8000

echo Browsers opened!
pause
