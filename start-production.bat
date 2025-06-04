@echo off
echo ====================================
echo   BEMAT Production Environment
echo ====================================
echo.

echo Starting Production Services (Database + API + Nginx)...
cd /d "c:\Users\30698\Building-Energy-Management-Tool-BEMAT\backend"
start "Production Services" cmd /k "docker-compose -f docker-compose.prod.yml up --build"

echo.
echo Waiting 15 seconds for services to initialize...
timeout /t 15 /nobreak > nul

echo Starting Frontend Service...
cd /d "c:\Users\30698\Building-Energy-Management-Tool-BEMAT\frontend"
start "Frontend Service" cmd /k "docker-compose -f docker-compose.frontend.yml up --build"

echo.
echo ====================================
echo   Production services are starting up!
echo ====================================
echo Application: http://localhost:1337 (Nginx)
echo Frontend: http://localhost:3000
echo API: http://localhost:8000 (via Nginx)
echo Database: PostgreSQL on port 5432
echo.
echo Waiting for all services to be ready...
timeout /t 45 /nobreak > nul

echo Opening browsers...
start http://localhost:1337
timeout /t 2 /nobreak > nul
start http://localhost:3000
echo.
echo Browsers opened! BEMAT Production Environment is ready.
echo.
echo Press any key to return to main menu...
pause > nul

cd /d "c:\Users\30698\Building-Energy-Management-Tool-BEMAT"
