@echo off
chcp 65001 >nul
title BEMAT - Building Energy Management Tool

:: ==========================================
:: BEMAT Unified Control Script
:: Clean version without emojis for better terminal display
:: ==========================================

:main
cls
echo.
echo ================================================
echo        BEMAT - Building Energy Management Tool
echo ================================================
echo.
echo   1. Quick Start (Recommended)
echo   2. Advanced Start + Diagnostics  
echo   3. Development Mode
echo   4. Fix Dependencies
echo   5. Rebuild Everything
echo   6. System Status
echo   7. Clean Reset
echo   8. Stop All Services
echo   9. Help
echo   0. Exit
echo.
echo ================================================
echo.
set /p choice="Choose option (0-9): "

if "%choice%"=="1" goto quick_start
if "%choice%"=="2" goto advanced_start
if "%choice%"=="3" goto development
if "%choice%"=="4" goto fix_deps
if "%choice%"=="5" goto rebuild
if "%choice%"=="6" goto status
if "%choice%"=="7" goto clean_reset
if "%choice%"=="8" goto stop_all
if "%choice%"=="9" goto help
if "%choice%"=="0" goto exit
echo Invalid choice. Please try again.
timeout /t 2 >nul
goto main

:quick_start
echo.
echo [QUICK START] Starting BEMAT...
echo INFO: This will take 3-15 minutes
echo.
call :check_docker
if errorlevel 1 goto main
call :build_and_start
goto main

:advanced_start
echo.
echo [ADVANCED START] Starting with diagnostics...
echo.
call :check_docker
if errorlevel 1 goto main
call :stop_existing
call :check_dependencies
call :build_and_start
call :show_urls
goto main

:development
echo.
echo [DEVELOPMENT MODE] Starting development environment...
echo.
call :check_docker
if errorlevel 1 goto main
call :stop_existing
echo INFO: Starting in development mode with live reload...
call scripts\start-development.bat
goto main

:fix_deps
echo.
echo [FIX DEPENDENCIES] Fixing dependency issues...
echo.
call scripts\install-deps-clean.bat
echo.
echo COMPLETED: Dependency fix attempt finished
pause
goto main

:rebuild
echo.
echo [REBUILD] Rebuilding all containers...
echo WARNING: This will delete all containers and rebuild from scratch
echo.
set /p confirm="Are you sure? (y/N): "
if /i not "%confirm%"=="y" goto main
call :stop_existing
call scripts\rebuild-containers.bat
goto main

:status
echo.
echo [SYSTEM STATUS] Checking system status...
echo.
call :check_docker
call :check_containers
call :check_dependencies
echo.
pause
goto main

:clean_reset
echo.
echo [CLEAN RESET] Performing complete cleanup...
echo WARNING: This will remove all containers, images, and dependencies
echo.
set /p confirm="Are you sure? (y/N): "
if /i not "%confirm%"=="y" goto main
call :stop_existing
docker system prune -a -f
echo INFO: Cleaned Docker resources
rmdir /s /q frontend\node_modules 2>nul
echo INFO: Cleaned frontend dependencies
echo COMPLETED: Clean reset finished
pause
goto main

:stop_all
echo.
echo [STOP ALL] Stopping all services...
echo.
call :stop_existing
echo COMPLETED: All services stopped
pause
goto main

:help
echo.
echo ================================================
echo                 HELP & TROUBLESHOOTING
echo ================================================
echo.
echo OPTION 1 - Quick Start:
echo   - Fastest way to start BEMAT
echo   - Builds and starts all services
echo   - Automatically opens URLs when ready
echo.
echo OPTION 2 - Advanced Start:
echo   - Includes system diagnostics
echo   - Shows detailed startup process
echo   - Better for troubleshooting
echo.
echo OPTION 3 - Development Mode:
echo   - Hot reload for code changes
echo   - Development tools enabled
echo   - For developers only
echo.
echo OPTION 4 - Fix Dependencies:
echo   - Reinstalls all dependencies cleanly
echo   - Fixes common installation issues
echo   - Run this if builds are failing
echo.
echo COMMON ISSUES:
echo   - Docker not running: Start Docker Desktop
echo   - Port conflicts: Stop other applications using ports 3000/8000
echo   - Build failures: Try option 4 (Fix Dependencies)
echo.
echo URLs after startup:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo.
pause
goto main

:exit
echo.
echo Thank you for using BEMAT!
exit /b 0

:: ==========================================
:: INTERNAL FUNCTIONS
:: ==========================================

:check_docker
echo Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker not found. Please install Docker Desktop.
    echo INFO: Download from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)
echo OK: Docker is running
exit /b 0

:stop_existing
echo Stopping existing containers...
cd backend
docker-compose down >nul 2>&1
cd ..\frontend
docker-compose -f docker-compose.frontend.yml down >nul 2>&1
cd ..
echo OK: Existing containers stopped
exit /b 0

:build_and_start
echo Building and starting services...
echo INFO: Backend starting...
cd backend
docker-compose up -d --build
if errorlevel 1 (
    echo ERROR: Backend failed to start
    cd ..
    pause
    exit /b 1
)
cd ..

echo INFO: Frontend starting...
cd frontend
docker-compose -f docker-compose.frontend.yml up -d --build
if errorlevel 1 (
    echo ERROR: Frontend failed to start
    cd ..
    pause
    exit /b 1
)
cd ..

echo OK: Services started
call :wait_for_services
exit /b 0

:wait_for_services
echo Waiting for services to be ready...

:wait_loop
echo Checking service availability...
curl.exe -s http://localhost:3000 >nul 2>&1
set frontend_status=%errorlevel%
curl.exe -s http://localhost:8000 >nul 2>&1
set backend_status=%errorlevel%

if %frontend_status%==0 if %backend_status%==0 (
    echo OK: All services are ready!
    call :show_urls
    exit /b 0
)

echo Services still starting, waiting 5 seconds...
timeout /t 5 /nobreak >nul
goto wait_loop

:show_urls
echo.
echo ================================================
echo                   SUCCESS!
echo ================================================
echo.
echo BEMAT is now running:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo.
echo Opening URLs in your browser...
start http://localhost:3000
timeout /t 2 >nul
start http://localhost:8000
echo.
echo TIP: Use Ctrl+C in this window to stop services
echo      Or run this script again and choose option 8
echo.
pause
exit /b 0

:check_containers
echo Checking container status...
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
exit /b 0

:check_dependencies
echo Checking dependencies...
if exist "frontend\node_modules" (
    echo OK: Frontend dependencies found
) else (
    echo WARNING: Frontend dependencies missing - run option 4
)
if exist "backend\app\Pipfile.lock" (
    echo OK: Backend dependencies configured  
) else (
    echo WARNING: Backend dependencies missing
)
exit /b 0
