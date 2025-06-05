@echo off
setlocal enabledelayedexpansion

echo ====================================
echo   🚀 BEMAT Smart Launcher
echo ====================================
echo.
echo This script will:
echo 1. Start all Docker containers
echo 2. Monitor service health
echo 3. Open browsers only when ready
echo.

REM Check if Docker is running
echo Checking Docker status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running!
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)
echo ✓ Docker is running

echo.
echo Starting all Docker containers...
echo.

REM Start backend services
echo [1/2] Starting Backend (API + Database)...
cd /d "%~dp0backend"
start "BEMAT Backend" cmd /k "docker-compose up --build"

REM Wait a moment for backend containers to initialize
timeout /t 15 /nobreak > nul

REM Start frontend
echo [2/2] Starting Frontend...
cd /d "%~dp0frontend"
start "BEMAT Frontend" cmd /k "docker-compose -f docker-compose.frontend.yml up --build"

echo.
echo ====================================
echo   ⏳ Waiting for services...
echo ====================================
echo.

set backend_ready=0
set frontend_ready=0
set max_attempts=30
set attempt=1

:health_check_loop
echo [Attempt %attempt%/%max_attempts%] Checking services status...

REM Check backend
if !backend_ready! equ 0 (
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8000' -TimeoutSec 3 -UseBasicParsing; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Backend is ready! (http://localhost:8000)
        set backend_ready=1
    ) else (
        echo ⏳ Backend still starting...
    )
)

REM Check frontend
if !frontend_ready! equ 0 (
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 3 -UseBasicParsing; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Frontend is ready! (http://localhost:3000)
        set frontend_ready=1
    ) else (
        echo ⏳ Frontend still starting...
    )
)

REM Check if both are ready
if !backend_ready! equ 1 if !frontend_ready! equ 1 (
    goto services_ready
)

REM Check if we've reached max attempts
set /a attempt+=1
if !attempt! gtr !max_attempts! (
    echo.
    echo ⚠️  Services are taking longer than expected to start.
    echo This might be normal for first-time setup or slower systems.
    echo.
    echo You can:
    echo 1. Wait a bit more and check manually at:
    echo    - Frontend: http://localhost:3000
    echo    - Backend: http://localhost:8000
    echo 2. Check the Docker terminal windows for any errors
    echo.
    goto ask_user_action
)

timeout /t 10 /nobreak > nul
echo.
goto health_check_loop

:services_ready
echo.
echo ====================================
echo   🎉 All services are ready!
echo ====================================
echo.
echo Opening browsers in 3 seconds...
timeout /t 3 /nobreak

echo Opening BEMAT application...
start http://localhost:3000
timeout /t 2 /nobreak > nul
start http://localhost:8000/admin

echo.
echo ====================================
echo   ✅ BEMAT Successfully Started!
echo ====================================
echo.
echo Your application is now running at:
echo   🌐 Main App:     http://localhost:3000
echo   🔧 Backend API:  http://localhost:8000
echo   👤 Admin Panel:  http://localhost:8000/admin
echo   📖 API Docs:     http://localhost:8000/api/docs/
echo.
echo To stop all services, run: stop-all.bat
echo.
goto end_script

:ask_user_action
echo Would you like to:
echo [1] Open browsers anyway (services might still be loading)
echo [2] Exit and check manually later
echo.
set /p user_choice="Enter your choice (1 or 2): "

if "!user_choice!"=="1" (
    echo.
    echo Opening browsers...
    start http://localhost:3000
    timeout /t 2 /nobreak > nul
    start http://localhost:8000
    echo.
    echo Browsers opened. If pages don't load immediately, please wait a moment.
) else (
    echo.
    echo Exiting. You can check the services manually:
    echo - Frontend: http://localhost:3000
    echo - Backend: http://localhost:8000
)

:end_script
echo.
echo Press any key to exit this window...
pause > nul
