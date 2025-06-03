@echo off
echo ====================================
echo   BEMAT Development Environment
echo ====================================
echo.

echo Starting Backend Services (Database + API)...
cd /d "c:\Users\30698\Building-Energy-Management-Tool-BEMAT\backend"
start "Backend Services" cmd /k "docker-compose up --build"

echo.
echo Waiting 10 seconds for backend to initialize...
timeout /t 10 /nobreak > nul

echo Starting Frontend Service...
cd /d "c:\Users\30698\Building-Energy-Management-Tool-BEMAT\frontend"
start "Frontend Service" cmd /k "docker-compose -f docker-compose.frontend.yml up --build"

echo.
echo ====================================
echo   All services are starting up!
echo ====================================
echo Backend API: http://localhost:8000
echo Frontend: http://localhost:3000
echo Database: PostgreSQL on port 5432
echo.
echo Press any key to return to main menu...
pause > nul

cd /d "c:\Users\30698\Building-Energy-Management-Tool-BEMAT"
