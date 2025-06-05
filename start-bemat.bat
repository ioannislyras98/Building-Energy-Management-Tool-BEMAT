@echo off
setlocal enabledelayedexpansion

echo ====================================
echo   🚀 BEMAT Smart Launcher
echo ====================================
echo.
echo This script will:
echo 1. Check Docker status
echo 2. Start all containers 
echo 3. Monitor service health
echo 4. Open browsers only when ready
echo.

REM Check if Docker is running
echo Checking Docker status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Docker is not running!
    echo.
    echo Please:
    echo 1. Start Docker Desktop
    echo 2. Wait for it to fully load
    echo 3. Try running this script again
    echo.
    pause
    exit /b 1
)
echo ✅ Docker is running

echo.
echo Starting all Docker containers...
echo ⚠️  This may take 3-15 minutes depending on your system.
echo.

REM Start backend services
echo [1/2] Starting Backend (API + Database)...
cd /d "%~dp0backend"
start "BEMAT Backend" cmd /k "docker-compose up --build"

REM Wait for backend containers to initialize
echo Waiting for backend containers to initialize...
timeout /t 15 /nobreak > nul

REM Start frontend
echo [2/2] Starting Frontend...
cd /d "%~dp0frontend"  
start "BEMAT Frontend" cmd /k "docker-compose -f docker-compose.frontend.yml up --build"

echo.
echo ====================================
echo   ⏳ Monitoring Service Health
echo ====================================
echo.
echo 📝 Note: First-time startup can take 10-15 minutes
echo 🔄 Services are building and starting...

echo.

set backend_ready=0
set frontend_ready=0
set max_attempts=90
set attempt=1

:health_check_loop  
echo [Attempt %attempt%/%max_attempts%] Checking services... (Elapsed: !attempt!0 seconds)

REM Check backend
if !backend_ready! equ 0 (
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8000' -TimeoutSec 3 -UseBasicParsing; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Backend is ready! (http://localhost:8000)
        set backend_ready=1
    ) else (
        echo ⏳ Backend still starting... (Database + Django API)
    )
) else (
    echo ✅ Backend ready
)

REM Check frontend  
if !frontend_ready! equ 0 (
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 3 -UseBasicParsing; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Frontend is ready! (http://localhost:3000)
        set frontend_ready=1
    ) else (
        echo ⏳ Frontend still starting... (React + Vite build)
    )
) else (
    echo ✅ Frontend ready
)

REM Check if both are ready
if !backend_ready! equ 1 if !frontend_ready! equ 1 (
    goto services_ready
)

REM Provide helpful updates at certain intervals
if !attempt! equ 10 (
    echo.
    echo 💡 Still loading... This is normal for first-time setup.
    echo    Docker is downloading images and installing dependencies.
    echo.
)
if !attempt! equ 30 (
    echo.
    echo 💡 Taking longer than usual... This can happen if:
    echo    - First time running (downloading Docker images)
    echo    - Slow internet connection
    echo    - System resource constraints
    echo.
    echo 📊 Check the Docker terminal windows for detailed progress.
    echo.
)

REM Check if we've reached max attempts (15 minutes)
set /a attempt+=1
if !attempt! gtr !max_attempts! (
    echo.
    echo ⚠️  TIMEOUT: Services took longer than 15 minutes to start.
    echo.
    echo This could indicate:
    echo 1. 🐌 Slow system or internet connection
    echo 2. 🔧 Docker configuration issues  
    echo 3. 📦 Missing dependencies or images
    echo 4. 💾 Insufficient disk space or memory
    echo.
    echo 🔍 TROUBLESHOOTING:
    echo    Check the Docker terminal windows for error messages.
    echo    Look for red error text or "failed" messages.
    echo.
    echo Common solutions:
    echo    - Restart Docker Desktop
    echo    - Run: docker system prune -a
    echo    - Check available disk space (need 5GB+)
    echo    - Close other applications to free memory
    echo.
    goto ask_user_action
)

timeout /t 10 /nobreak > nul
echo.
goto health_check_loop
:services_ready
echo.
echo ====================================
echo   🎉 All Services Ready!
echo ====================================
echo.
echo ⏱️  Total startup time: !attempt!0 seconds
echo.
echo Opening browsers in 3 seconds...
timeout /t 3 /nobreak

echo 🌐 Opening BEMAT application...
start http://localhost:3000
timeout /t 2 /nobreak > nul
echo 🔧 Opening admin panel...
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
echo 🛑 To stop all services, run: stop-all.bat
echo.
goto end_script

:ask_user_action
echo ❓ What would you like to do?
echo.
echo [1] 🌐 Open browsers anyway (services might still be loading)
echo [2] ⏰ Wait 5 more minutes  
echo [3] ❌ Exit and troubleshoot manually
echo.
set /p user_choice="Enter your choice (1, 2, or 3): "

if "!user_choice!"=="1" (
    echo.
    echo 🌐 Opening browsers...
    start http://localhost:3000
    timeout /t 2 /nobreak > nul
    start http://localhost:8000
    echo.
    echo ⚠️  If pages show errors, wait a moment and refresh.
    echo    Services might still be finishing their startup.
    goto end_script
) else if "!user_choice!"=="2" (
    echo.
    echo ⏰ Waiting 5 more minutes...
    set max_attempts=120
    set attempt=90
    goto health_check_loop
) else (
    echo.
    echo ❌ Exiting. You can check the services manually:
    echo.
    echo 🔍 Check Docker terminal windows for errors
    echo 🌐 Try these URLs later:
    echo    - http://localhost:3000 (Frontend)
    echo    - http://localhost:8000 (Backend)
    echo.
    echo 💡 If issues persist:
    echo    1. Run: stop-all.bat
    echo    2. Restart Docker Desktop
    echo    3. Run: rebuild-containers.bat
    echo.
)

:end_script
echo.
echo Press any key to close this window...
pause > nul
