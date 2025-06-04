@echo off
:menu
cls
echo ====================================
echo   BEMAT Docker Management Tool
echo ====================================
echo.
echo Select an option:
echo.
echo 1. Start Development Environment
echo 2. Stop All Services
echo 3. Rebuild Containers (Force Update Dependencies)
echo 4. View Docker Status
echo 5. Clean Docker System
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto dev
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto rebuild
if "%choice%"=="4" goto status
if "%choice%"=="5" goto clean
if "%choice%"=="6" goto exit
goto menu

:dev
echo.
echo Starting Development Environment...
call start-development.bat
goto menu

:stop
echo.
echo Stopping All Services...
call stop-all.bat
goto menu

:rebuild
echo.
echo Rebuilding All Containers with Latest Dependencies...
call rebuild-containers.bat
goto menu

:status
echo.
echo ====================================
echo   Docker Containers Status
echo ====================================
docker ps -a
echo.
echo ====================================
echo   Docker Images
echo ====================================
docker images
echo.
pause
goto menu

:clean
echo.
echo ====================================
echo   Cleaning Docker System
echo ====================================
echo This will remove all stopped containers, unused networks, and dangling images.
set /p confirm="Are you sure? (y/n): "
if /i "%confirm%"=="y" (
    docker system prune -a -f
    docker volume prune -f
    echo Docker system cleaned successfully!
) else (
    echo Operation cancelled.
)
echo.
pause
goto menu

:exit
echo.
echo Thank you for using BEMAT Docker Management Tool!
pause
exit
