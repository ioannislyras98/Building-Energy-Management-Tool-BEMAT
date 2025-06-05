@echo off
setlocal enabledelayedexpansion

echo ====================================
echo   🚀 BEMAT Detached Mode Launcher
echo ====================================
echo.
echo This script starts all containers in background mode.
echo You can safely close this terminal after startup.
echo.

REM Check if Docker is running
echo Checking Docker status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo ✅ Docker is running

echo.
echo [1/2] Starting Backend (Database + API) in detached mode...
cd /d "%~dp0backend"
docker-compose up -d --build
if errorlevel 1 (
    echo ❌ Backend failed to start
    pause
    exit /b 1
)
echo ✅ Backend started successfully

echo.
echo [2/2] Starting Frontend in detached mode...
cd /d "%~dp0frontend"
docker-compose -f docker-compose.frontend.yml up -d --build
if errorlevel 1 (
    echo ❌ Frontend failed to start
    pause
    exit /b 1
)
echo ✅ Frontend started successfully

echo.
echo ====================================
echo   🎉 All Services Running!
echo ====================================
echo.
echo Services are now running in the background:
echo   • Frontend: http://localhost:3000
echo   • Backend:  http://localhost:8000
echo   • Database: PostgreSQL (internal)
echo.
echo ⚠️  IMPORTANT: These containers will keep running even
echo    after you close this terminal window.
echo.
echo 🛑 To stop all services later, run: stop-all.bat
echo 📊 To check status, run: docker ps
echo.

REM Wait a moment and then check if services are responding
echo Waiting for services to be ready...
timeout /t 15 /nobreak > nul

echo Testing services...
set backend_ready=0
set frontend_ready=0

REM Check backend
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8000' -TimeoutSec 5 -UseBasicParsing; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ Backend is responding at http://localhost:8000
    set backend_ready=1
) else (
    echo ⏳ Backend is still starting up...
)

REM Check frontend
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 5 -UseBasicParsing; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ Frontend is responding at http://localhost:3000
    set frontend_ready=1
) else (
    echo ⏳ Frontend is still starting up...
)

echo.
if !backend_ready! equ 1 if !frontend_ready! equ 1 (
    echo 🎉 All services are ready! Opening browsers...
    start http://localhost:3000
    timeout /t 2 /nobreak > nul
    start http://localhost:8000
) else (
    echo 💡 Services are still starting. You can:
    echo    • Wait a few more minutes
    echo    • Check manually: http://localhost:3000
    echo    • Run 'docker ps' to see container status
)

echo.
echo 🔧 Useful commands:
echo    docker ps                    - View running containers
echo    docker-compose logs web      - View backend logs
echo    docker logs frontend-frontend-1 - View frontend logs
echo    stop-all.bat               - Stop all services
echo.
echo You can now safely close this terminal window.
echo The containers will continue running in the background.
echo.
pause
