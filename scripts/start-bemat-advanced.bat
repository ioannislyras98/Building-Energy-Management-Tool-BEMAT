@echo off
setlocal enabledelayedexpansion

REM ====================================
REM   BEMAT Advanced Start Script
REM ====================================

echo ====================================
echo   BEMAT Advanced Startup
echo ====================================
echo.

REM Check if Docker Desktop is running
echo [0/4] Checking Docker Desktop...
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker Desktop is not running!
    echo Please start Docker Desktop and wait for it to fully load.
    echo Then run this script again.
    echo.
    echo Press any key to open Docker Desktop...
    pause >nul
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo Waiting for Docker Desktop to start...
    echo Please run this script again once Docker Desktop is ready.
    pause
    exit /b 1
)
echo ✓ Docker Desktop is running

REM Stop any existing containers
echo [1/4] Stopping existing containers...
cd /d "%~dp0backend"
docker-compose down >nul 2>&1
cd /d "%~dp0frontend"
docker-compose -f docker-compose.frontend.yml down >nul 2>&1
echo ✓ Cleaned up existing containers

REM Check if ports are available
echo [2/4] Checking port availability...
netstat -ano | findstr :3000 >nul
if not errorlevel 1 (
    echo WARNING: Port 3000 is in use. Frontend may not start correctly.
)
netstat -ano | findstr :8000 >nul
if not errorlevel 1 (
    echo WARNING: Port 8000 is in use. Backend may not start correctly.
)
netstat -ano | findstr :5432 >nul
if not errorlevel 1 (
    echo WARNING: Port 5432 is in use. Database may not start correctly.
)

REM Start backend services
echo [3/4] Starting Backend Services...
cd /d "%~dp0backend"
echo    - Building and starting Database and API...
start "BEMAT Backend" cmd /k "docker-compose up --build"

REM Wait for backend to be ready
echo    - Waiting for backend to be ready...
timeout /t 15 /nobreak > nul

REM Check if backend is responding
echo    - Testing backend connection...
set "backendReady=false"
for /l %%i in (1,1,10) do (
    curl -s http://localhost:8000/ >nul 2>&1
    if not errorlevel 1 (
        set "backendReady=true"
        goto :backend_ready
    )
    echo      Attempt %%i/10: Backend not ready yet...
    timeout /t 3 /nobreak > nul
)

:backend_ready
if "!backendReady!"=="true" (
    echo ✓ Backend is responding
) else (
    echo ! Backend may not be fully ready yet
)

REM Start frontend
echo [4/4] Starting Frontend...
cd /d "%~dp0frontend"
echo    - Installing/updating npm dependencies...
echo    - Building and starting React application...
start "BEMAT Frontend" cmd /k "docker-compose -f docker-compose.frontend.yml up --build"

echo    - Waiting for frontend to be ready...
timeout /t 20 /nobreak > nul

REM Check if frontend is responding
echo    - Testing frontend connection...
set "frontendReady=false"
for /l %%i in (1,1,10) do (
    curl -s http://localhost:3000/ >nul 2>&1
    if not errorlevel 1 (
        set "frontendReady=true"
        goto :frontend_ready
    )
    echo      Attempt %%i/10: Frontend not ready yet...
    timeout /t 3 /nobreak > nul
)

:frontend_ready
echo.
echo ====================================
echo   BEMAT Startup Complete!
echo ====================================
echo.
echo Services Status:
echo   Backend API: http://localhost:8000 %if "!backendReady!"=="true" (echo [✓ Ready]) else (echo [? Starting])%
echo   Frontend:    http://localhost:3000 %if "!frontendReady!"=="true" (echo [✓ Ready]) else (echo [? Starting])%
echo   Admin Panel: http://localhost:8000/admin
echo.
echo Two terminal windows are now open:
echo   - Backend: Database + Django API
echo   - Frontend: React + Vite dev server
echo.

REM Open browsers
echo Opening browsers in 5 seconds...
timeout /t 5 /nobreak > nul
start http://localhost:3000
timeout /t 2 /nobreak > nul
start http://localhost:8000

echo.
echo ✓ Browsers opened!
echo.
echo Troubleshooting:
echo   - If services don't work, check the terminal windows for errors
echo   - Run stop-all.bat to stop all services
echo   - Run docker-manager.bat for more options
echo.
echo Press any key to exit this window...
pause > nul
