@echo off
REM Fix line endings for shell scripts after clone
echo ====================================
echo   BEMAT - Line Endings Fix
echo ====================================
echo.

echo [1/3] Configuring Git...
git config core.autocrlf false
git config core.eol lf

echo [2/3] Fixing backend shell scripts...
REM Convert entrypoint.sh to Unix line endings
if exist "backend\app\entrypoint.sh" (
    powershell -Command "(Get-Content backend\app\entrypoint.sh -Raw).Replace(\"`r`n\", \"`n\") | Set-Content backend\app\entrypoint.sh -NoNewline"
    echo Fixed entrypoint.sh
)

echo [3/3] Fixing critical frontend files...
REM Fix package.json if it has CRLF line endings
if exist "frontend\package.json" (
    powershell -Command "(Get-Content frontend\package.json -Raw).Replace(\"`r`n\", \"`n\") | Set-Content frontend\package.json -NoNewline"
    echo Fixed package.json
)

REM Fix Dockerfile if it has CRLF line endings
if exist "frontend\Dockerfile" (
    powershell -Command "(Get-Content frontend\Dockerfile -Raw).Replace(\"`r`n\", \"`n\") | Set-Content frontend\Dockerfile -NoNewline"
    echo Fixed Dockerfile
)

echo.
echo Line endings fixed!
echo You can now run: docker-compose up
echo.
echo For comprehensive frontend fix, run: fix-frontend-clone-issues.bat
pause
