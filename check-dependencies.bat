@echo off
echo ====================================
echo   BEMAT - Dependency Check
echo ====================================
echo.

REM Check Docker
echo [1/4] Checking Docker Desktop...
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker Desktop is not running
    echo Please start Docker Desktop first
    exit /b 1
) else (
    echo Docker Desktop is running
)

REM Check if images exist
echo [2/4] Checking Docker images...
docker images | findstr bemat >nul
if errorlevel 1 (
    echo  No BEMAT images found - will build on first run
) else (
    echo BEMAT images found
)

REM Check frontend dependencies
echo [3/4] Checking frontend package.json...
if exist "frontend\package.json" (
    findstr "jquery" frontend\package.json >nul
    if errorlevel 1 (
        echo jQuery missing from package.json
    ) else (
        echo jQuery found
    )
    
    findstr "@mui/material" frontend\package.json >nul
    if errorlevel 1 (
        echo Material-UI missing from package.json
    ) else (
        echo Material-UI found
    )
    
    findstr "react-icons" frontend\package.json >nul
    if errorlevel 1 (
        echo React Icons missing from package.json
    ) else (
        echo React Icons found
    )
    
    findstr "recharts" frontend\package.json >nul
    if errorlevel 1 (
        echo Recharts missing from package.json
    ) else (
        echo Recharts found
    )
) else (
    echo frontend/package.json not found
)

REM Check ports
echo [4/4] Checking port availability...
netstat -ano | findstr :3000 >nul
if not errorlevel 1 (
    echo Port 3000 is in use
) else (
    echo Port 3000 is available
)

netstat -ano | findstr :8000 >nul
if not errorlevel 1 (
    echo  Port 8000 is in use
) else (
    echo Port 8000 is available
)

echo.
echo ====================================
echo   Dependency Check Complete
echo ====================================
echo.
echo If all checks passed, you can run:
echo   start-bemat.bat          (Quick start)
echo   start-bemat-advanced.bat (Advanced with diagnostics)
echo   rebuild-containers.bat   (Force rebuild dependencies)
echo.
pause
