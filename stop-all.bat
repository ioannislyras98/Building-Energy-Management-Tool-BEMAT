@echo off
echo ====================================
echo   BEMAT Docker Management Tool
echo ====================================
echo.
echo Stopping all BEMAT containers...

echo Stopping Backend Services...
cd /d "c:\Users\30698\Building-Energy-Management-Tool-BEMAT\backend"
docker-compose down
docker-compose -f docker-compose.prod.yml down

echo.
echo Stopping Frontend Service...
cd /d "c:\Users\30698\Building-Energy-Management-Tool-BEMAT\frontend"
docker-compose -f docker-compose.frontend.yml down

echo.
echo Cleaning up Docker resources...
docker system prune -f

echo.
echo ====================================
echo   All BEMAT services stopped!
echo ====================================
echo.
pause

cd /d "c:\Users\30698\Building-Energy-Management-Tool-BEMAT"
