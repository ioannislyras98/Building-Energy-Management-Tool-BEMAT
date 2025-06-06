# BEMAT Control Center
# Building Energy Management Tool - Unified Control Script

function Show-Menu {
    Clear-Host
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "        BEMAT - Building Energy Management Tool" -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  1. Quick Start (Recommended)" -ForegroundColor Green
    Write-Host "  2. Advanced Start + Diagnostics" -ForegroundColor Yellow  
    Write-Host "  3. Development Mode" -ForegroundColor Magenta
    Write-Host "  4. Fix Dependencies" -ForegroundColor Blue
    Write-Host "  5. Rebuild Everything" -ForegroundColor Red
    Write-Host "  6. System Status" -ForegroundColor White
    Write-Host "  7. Clean Reset" -ForegroundColor DarkRed
    Write-Host "  8. Stop All Services" -ForegroundColor Gray
    Write-Host "  9. Help" -ForegroundColor DarkYellow
    Write-Host "  0. Exit" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Test-Docker {
    Write-Host "Checking Docker..." -ForegroundColor Yellow
    
    if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: Docker not found. Please install Docker Desktop." -ForegroundColor Red
        Read-Host "Press Enter to continue"
        return $false
    }
    
    try {
        docker info 2>$null | Out-Null
        Write-Host "OK: Docker is running" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "ERROR: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
        Read-Host "Press Enter to continue"
        return $false
    }
}

function Stop-Existing {
    Write-Host "Stopping existing containers..." -ForegroundColor Yellow
    
    Set-Location "$PSScriptRoot\backend"
    docker-compose down 2>$null
    
    Set-Location "$PSScriptRoot\frontend"
    docker-compose -f docker-compose.frontend.yml down 2>$null
    
    Write-Host "OK: Existing containers stopped" -ForegroundColor Green
    Set-Location $PSScriptRoot
}

function Start-Services {
    Write-Host "Building and starting services..." -ForegroundColor Yellow
    
    # Start backend
    Set-Location "$PSScriptRoot\backend"
    docker-compose up -d --build
    
    # Start frontend
    Set-Location "$PSScriptRoot\frontend"
    docker-compose -f docker-compose.frontend.yml up -d --build
    
    Write-Host "OK: Services started" -ForegroundColor Green
    Set-Location $PSScriptRoot
}

function Test-HealthCheck {
    Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
    
    while ($true) {
        try {
            $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
            $backend = Invoke-WebRequest -Uri "http://localhost:8000" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
            
            if ($frontend.StatusCode -eq 200 -and $backend.StatusCode -eq 200) {
                Write-Host "OK: All services are ready!" -ForegroundColor Green
                return $true
            }
        }
        catch {
            # Services not ready yet
        }
        
        Write-Host "Services still starting, waiting 5 seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

function Open-Browsers {
    Write-Host "Opening browsers..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:3000"
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:8000"
    Write-Host "OK: Browsers opened" -ForegroundColor Green
}

function Quick-Start {
    Write-Host ""
    Write-Host "Starting BEMAT - Quick Mode..." -ForegroundColor Green
    Write-Host "This will take 3-15 minutes" -ForegroundColor Yellow
    Write-Host ""
    
    if (!(Test-Docker)) { return }
    Start-Services
    if (Test-HealthCheck) {
        Open-Browsers
    }
    Read-Host "Press Enter to return to menu"
}

function Advanced-Start {
    Write-Host ""
    Write-Host "Starting BEMAT - Advanced Mode with Diagnostics..." -ForegroundColor Yellow
    Write-Host ""
    
    Show-Diagnostics
    if (!(Test-Docker)) { return }
    Test-Ports
    Stop-Existing
    Start-Services
    if (Test-HealthCheck) {
        Open-Browsers
    }
    Read-Host "Press Enter to return to menu"
}

function Development-Mode {
    Write-Host ""
    Write-Host "Starting Development Environment..." -ForegroundColor Magenta
    Write-Host "Terminal windows will open for debugging" -ForegroundColor Yellow
    Write-Host ""
    
    if (!(Test-Docker)) { return }
    Stop-Existing
    
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"$PSScriptRoot\backend`" && docker-compose up --build" -WindowStyle Normal
    Start-Sleep -Seconds 10
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"$PSScriptRoot\frontend`" && docker-compose -f docker-compose.frontend.yml up --build" -WindowStyle Normal
    
    if (Test-HealthCheck) {
        Open-Browsers
    }
    Read-Host "Press Enter to return to menu"
}

function Fix-Dependencies {
    Write-Host ""
    Write-Host "Fixing Dependencies..." -ForegroundColor Blue
    Write-Host ""
    
    Write-Host "Cleaning frontend dependencies..." -ForegroundColor Yellow
    Set-Location "$PSScriptRoot\frontend"
    
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules"
    }
    if (Test-Path "package-lock.json") {
        Remove-Item -Force "package-lock.json"
    }
    
    Write-Host "Fresh install without legacy flags..." -ForegroundColor Yellow
    npm cache clean --force
    npm install --resolution-mode=highest
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Standard install failed, trying with force..." -ForegroundColor Yellow
        npm install --force
    }
    
    Write-Host "Frontend dependencies fixed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Checking backend dependencies..." -ForegroundColor Yellow
    Set-Location "$PSScriptRoot\backend"
    docker-compose exec web pip install -r requirements.txt 2>$null
    Write-Host "Dependencies check complete!" -ForegroundColor Green
    
    Set-Location $PSScriptRoot
    Read-Host "Press Enter to return to menu"
}

function Rebuild-Everything {
    Write-Host ""
    Write-Host "Rebuilding Everything from Scratch..." -ForegroundColor Red
    Write-Host "WARNING: This will remove all containers and rebuild" -ForegroundColor Yellow
    Write-Host ""
    
    $confirm = Read-Host "Are you sure? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") { return }
    
    Stop-Existing
    Write-Host "Cleaning Docker system..." -ForegroundColor Yellow
    docker system prune -f
    docker volume prune -f
    
    Write-Host "Rebuilding backend..." -ForegroundColor Yellow
    Set-Location "$PSScriptRoot\backend"
    docker-compose up -d --build --force-recreate
    
    Write-Host "Rebuilding frontend..." -ForegroundColor Yellow
    Set-Location "$PSScriptRoot\frontend"
    docker-compose -f docker-compose.frontend.yml up -d --build --force-recreate
    
    Set-Location $PSScriptRoot
    if (Test-HealthCheck) {
        Open-Browsers
    }
    Read-Host "Press Enter to return to menu"
}

function Show-Status {
    Write-Host ""
    Write-Host "BEMAT System Status" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Docker Status:" -ForegroundColor Yellow
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        docker --version
        try {
            docker info 2>$null | Out-Null
            Write-Host "OK: Docker is running" -ForegroundColor Green
        }
        catch {
            Write-Host "ERROR: Docker is not running" -ForegroundColor Red
        }
    } else {
        Write-Host "ERROR: Docker not installed" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Containers:" -ForegroundColor Yellow
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    Write-Host ""
    Write-Host "Port Status:" -ForegroundColor Yellow
    $ports = @(3000, 8000, 5432)
    foreach ($port in $ports) {
        $connections = netstat -ano | Select-String ":$port"
        if ($connections) {
            Write-Host "OK: Port $port in use" -ForegroundColor Green
        } else {
            Write-Host "FREE: Port $port available" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "URLs:" -ForegroundColor Yellow
    Write-Host "    Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "    Backend:  http://localhost:8000" -ForegroundColor White
    Write-Host "    Admin:    http://localhost:8000/admin" -ForegroundColor White
    Write-Host ""
    
    Read-Host "Press Enter to return to menu"
}

function Clean-Reset {
    Write-Host ""
    Write-Host "Clean Reset - Complete System Cleanup" -ForegroundColor DarkRed
    Write-Host "WARNING: This will remove EVERYTHING and start fresh" -ForegroundColor Yellow
    Write-Host ""
    
    $confirm = Read-Host "This will delete all data! Continue? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") { return }
    
    Stop-Existing
    Write-Host "Removing all containers..." -ForegroundColor Yellow
    docker container prune -f
    Write-Host "Removing all images..." -ForegroundColor Yellow
    docker image prune -a -f
    Write-Host "Removing all volumes..." -ForegroundColor Yellow
    docker volume prune -f
    
    Write-Host "Cleaning frontend..." -ForegroundColor Yellow
    Set-Location "$PSScriptRoot\frontend"
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules"
    }
    if (Test-Path "package-lock.json") {
        Remove-Item -Force "package-lock.json"
    }
    
    Set-Location $PSScriptRoot
    Write-Host "System completely cleaned!" -ForegroundColor Green
    Write-Host "Ready for fresh start" -ForegroundColor Green
    Read-Host "Press Enter to return to menu"
}

function Stop-AllServices {
    Write-Host ""
    Write-Host "Stopping all BEMAT services..." -ForegroundColor Gray
    Stop-Existing
    Write-Host "All services stopped" -ForegroundColor Green
    Read-Host "Press Enter to return to menu"
}

function Show-Help {
    Clear-Host
    Write-Host ""
    Write-Host "BEMAT Help & Troubleshooting" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Common Issues:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host '1. "Failed to resolve import" errors:' -ForegroundColor White
    Write-Host "   - Use option 4 (Fix Dependencies)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Containers won't start:" -ForegroundColor White
    Write-Host "   - Use option 2 (Advanced Start)" -ForegroundColor Gray
    Write-Host "   - Check Docker Desktop is running" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Port conflicts:" -ForegroundColor White
    Write-Host "   - Use option 6 (System Status) to check" -ForegroundColor Gray
    Write-Host "   - Stop conflicting applications" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Frontend crashes after clone:" -ForegroundColor White
    Write-Host "   - Use option 7 (Clean Reset)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "5. Performance issues:" -ForegroundColor White
    Write-Host "   - Use option 5 (Rebuild Everything)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Useful URLs:" -ForegroundColor Yellow
    Write-Host "    Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "    Backend:  http://localhost:8000" -ForegroundColor White
    Write-Host "    Admin:    http://localhost:8000/admin" -ForegroundColor White
    Write-Host ""
    Write-Host "For more help, check README.md" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to return to menu"
}

function Test-Ports {
    Write-Host "Checking ports..." -ForegroundColor Yellow
    
    $ports = @(3000, 8000, 5432)
    foreach ($port in $ports) {
        $connections = netstat -ano | Select-String ":$port"
        if ($connections) {
            Write-Host "WARNING: Port $port is in use" -ForegroundColor Yellow
            $kill = Read-Host "Kill process on port $port? (y/N)"
            if ($kill -eq "y" -or $kill -eq "Y") {
                $processes = netstat -ano | Select-String ":$port" | ForEach-Object { ($_ -split '\s+')[-1] }
                foreach ($pid in $processes) {
                    try {
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    }
                    catch {
                        # Process might not exist anymore
                    }
                }
            }
        }
    }
    Write-Host "OK: Ports checked" -ForegroundColor Green
}

function Show-Diagnostics {
    Write-Host "Running full system diagnostics..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "System Information:" -ForegroundColor Yellow
    Write-Host "OS: $env:OS" -ForegroundColor White
    Write-Host "Processor: $env:PROCESSOR_ARCHITECTURE" -ForegroundColor White
    Write-Host ""
    
    # Check disk space
    $drive = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
    $freeGB = [math]::Round($drive.FreeSpace / 1GB, 2)
    Write-Host "C: Drive Free Space: $freeGB GB" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Docker System Info:" -ForegroundColor Yellow
    try {
        docker system df
    }
    catch {
        Write-Host "ERROR: Cannot get Docker system info" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "OK: Diagnostics complete" -ForegroundColor Green
}

# Main script loop
$Host.UI.RawUI.WindowTitle = "BEMAT Control Center"

do {
    Show-Menu
    $choice = Read-Host "Choose option (0-9)"
    
    switch ($choice) {
        "1" { Quick-Start }
        "2" { Advanced-Start }
        "3" { Development-Mode }
        "4" { Fix-Dependencies }
        "5" { Rebuild-Everything }
        "6" { Show-Status }
        "7" { Clean-Reset }
        "8" { Stop-AllServices }
        "9" { Show-Help }
        "0" { 
            Write-Host ""
            Write-Host "Thanks for using BEMAT!" -ForegroundColor Green
            Write-Host ""
            exit 
        }
        default {
            Write-Host "Invalid choice. Please try again." -ForegroundColor Red
            Start-Sleep -Seconds 2
        }
    }
} while ($true)
