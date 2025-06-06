# BEMAT Control Center
# Building Energy Management Tool - Unified Control Script

function Show-Menu {
    Clear-Host
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "        BEMAT - Building Energy Management Tool" -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  1. Start BEMAT (Recommended)" -ForegroundColor Green
    Write-Host "  2. Stop All Services" -ForegroundColor Gray
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
    
    # Start backend first
    Write-Host "Starting backend..." -ForegroundColor Yellow
    Set-Location "$PSScriptRoot\backend"
    docker-compose up -d --build
    Write-Host "Backend started" -ForegroundColor Green
    
    # Start frontend second
    Write-Host "Starting frontend..." -ForegroundColor Yellow
    Set-Location "$PSScriptRoot\frontend"
    docker-compose -f docker-compose.frontend.yml up -d --build
    Write-Host "Frontend started" -ForegroundColor Green
    
    Write-Host "OK: All services started" -ForegroundColor Green
    Set-Location $PSScriptRoot
}

function Open-Browsers {
    Write-Host "Opening browsers..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:3000"
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:8000"
    Write-Host "OK: Browsers opened" -ForegroundColor Green
}

function Start-BEMAT {
    Write-Host ""
    Write-Host "Starting BEMAT..." -ForegroundColor Green
    Write-Host ""
    
    if (!(Test-Docker)) { return }
    Start-Services
    Open-Browsers
    Read-Host "Press Enter to return to menu"
}

function Stop-AllServices {
    Write-Host ""
    Write-Host "Stopping all BEMAT services..." -ForegroundColor Gray
    Stop-Existing
    Write-Host "All services stopped" -ForegroundColor Green
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
    $choice = Read-Host "Choose option (0-2)"
    
    switch ($choice) {
        "1" { Start-BEMAT }
        "2" { Stop-AllServices }
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
