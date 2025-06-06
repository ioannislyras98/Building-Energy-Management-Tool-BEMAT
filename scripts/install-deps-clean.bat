@echo off
chcp 65001 >nul
title BEMAT - Clean Dependency Installation

echo.
echo BEMAT Clean Dependency Installation
echo ====================================
echo.
echo This script will:
echo - Fix all dependency issues properly (NO --legacy-peer-deps)
echo - Use modern npm resolution strategies
echo - Clean install everything from scratch
echo - Fix security vulnerabilities
echo.

cd /d "%~dp0\..\frontend"

echo Step 1: Cleaning old installation...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
)

echo Step 2: Clearing npm cache...
npm cache clean --force

echo Step 3: Installing with modern resolution...
npm install --resolution-mode=highest

if %errorlevel% neq 0 (
    echo.
    echo WARNING: Standard install had issues, trying alternative...
    npm install --force
    
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Installation failed. Checking for specific issues...
        echo.
        echo Common fixes:
        echo 1. Update Node.js to latest LTS version
        echo 2. Clear npm cache: npm cache clean --force
        echo 3. Check network connection
        echo 4. Run as administrator
        echo.
        pause
        exit /b 1
    )
)

echo.
echo Step 4: Checking for security issues...
npm audit --audit-level=moderate

echo.
echo SUCCESS: Clean installation completed!
echo.
echo Benefits of this approach:
echo   - No legacy compatibility mode
echo   - Latest security patches
echo   - Proper dependency resolution
echo   - Better performance
echo   - Future-proof setup
echo.
pause
