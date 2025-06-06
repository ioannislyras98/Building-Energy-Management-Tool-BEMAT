@echo off
REM Fix line endings for shell scripts after clone
echo Fixing line endings for shell scripts...

REM Convert entrypoint.sh to Unix line endings
powershell -Command "(Get-Content backend\app\entrypoint.sh -Raw).Replace(\"`r`n\", \"`n\") | Set-Content backend\app\entrypoint.sh -NoNewline"

echo Line endings fixed!
echo You can now run: docker-compose up
pause
