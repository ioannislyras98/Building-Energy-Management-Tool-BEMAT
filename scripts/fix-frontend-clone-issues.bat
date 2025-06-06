@echo off
REM Fix frontend clone issues - comprehensive solution
echo ====================================
echo   BEMAT - Frontend Clone Issues Fix
echo ====================================
echo.

echo [1/5] Configuring Git for optimal clone experience...

REM Configure git to handle line endings properly for this repository
git config core.autocrlf false
git config core.eol lf
echo Git line ending configuration updated.

echo [2/5] Fixing line endings for frontend files...

REM Fix line endings for all JavaScript/TypeScript files
echo Fixing JavaScript/TypeScript files...
for /r frontend %%f in (*.js *.jsx *.ts *.tsx *.mjs *.cjs) do (
    if exist "%%f" (
        powershell -Command "(Get-Content '%%f' -Raw).Replace(\"`r`n\", \"`n\") | Set-Content '%%f' -NoNewline"
    )
)

REM Fix line endings for configuration files
echo Fixing configuration files...
for /r frontend %%f in (*.config.js *.config.ts *.config.mjs vite.config.* tailwind.config.* postcss.config.* eslint.config.*) do (
    if exist "%%f" (
        powershell -Command "(Get-Content '%%f' -Raw).Replace(\"`r`n\", \"`n\") | Set-Content '%%f' -NoNewline"
    )
)

REM Fix package.json and package-lock.json
echo Fixing package files...
if exist "frontend\package.json" (
    powershell -Command "(Get-Content 'frontend\package.json' -Raw).Replace(\"`r`n\", \"`n\") | Set-Content 'frontend\package.json' -NoNewline"
)
if exist "frontend\package-lock.json" (
    powershell -Command "(Get-Content 'frontend\package-lock.json' -Raw).Replace(\"`r`n\", \"`n\") | Set-Content 'frontend\package-lock.json' -NoNewline"
)

REM Fix HTML and CSS files
echo Fixing HTML/CSS files...
for /r frontend %%f in (*.html *.css *.scss) do (
    if exist "%%f" (
        powershell -Command "(Get-Content '%%f' -Raw).Replace(\"`r`n\", \"`n\") | Set-Content '%%f' -NoNewline"
    )
)

REM Fix Dockerfile
echo Fixing Dockerfile...
if exist "frontend\Dockerfile" (
    powershell -Command "(Get-Content 'frontend\Dockerfile' -Raw).Replace(\"`r`n\", \"`n\") | Set-Content 'frontend\Dockerfile' -NoNewline"
)

echo [3/5] Fixing frontend dependencies...
if exist "frontend\node_modules" (
    echo Removing node_modules...
    rmdir /s /q "frontend\node_modules"
)

echo Clearing npm cache...
cd frontend
npm cache clean --force 2>nul

echo Installing dependencies with clean install...
npm ci --no-optional --legacy-peer-deps 2>nul
if errorlevel 1 (
    echo npm ci failed, trying npm install...
    npm install --legacy-peer-deps
    if errorlevel 1 (
        echo WARNING: npm install failed. You may need to run it manually.
    )
)

echo Verifying universal-cookie installation...
if not exist "node_modules\universal-cookie\package.json" (
    echo Installing universal-cookie explicitly...
    npm install universal-cookie@^7.2.2 --save
)

cd ..

echo [4/5] Refreshing git index to apply line ending changes...
git add --renormalize .

echo [5/5] Creating clone-ready state...
REM Set recommended git attributes for future clones
git config core.autocrlf false
git config core.eol lf

echo.
echo ====================================
echo   Fix completed successfully!
echo ====================================
echo.
echo Next steps:
echo 1. Commit these changes to the repository
echo 2. Future clones will have proper line endings
echo 3. Run 'start-bemat.bat' to test the frontend
echo.
echo For fresh clones, users should run:
echo   git config core.autocrlf false
echo   git config core.eol lf
echo.
pause
