@echo off
echo ====================================
echo   BEMAT Quick Start
echo ====================================
echo.
echo Starting all Docker containers...
echo.

REM Start backend services
echo [1/2] Starting Backend (API + Database)...
cd /d "c:\Users\30698\Building-Energy-Management-Tool-BEMAT\backend"
start "BEMAT Backend" cmd /k "docker-compose up --build"

REM Wait a bit for backend to start
timeout /t 10 /nobreak > nul

REM Start frontend
echo [2/2] Starting Frontend...
cd /d "c:\Users\30698\Building-Energy-Management-Tool-BEMAT\frontend"
start "BEMAT Frontend" cmd /k "docker-compose -f docker-compose.frontend.yml up --build"

echo.
echo ====================================
echo   BEMAT is starting up!
echo ====================================
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo.
echo Two terminal windows have opened:
echo - One for Backend services
echo - One for Frontend service
echo.
echo Waiting for services to be ready...
timeout /t 30 /nobreak > nul

echo Opening browsers...
start http://localhost:3000
timeout /t 2 /nobreak > nul
start http://localhost:8000
echo.
echo Browsers opened! Your BEMAT application is ready.
echo.
echo Press any key to exit this window...
pause > nul
