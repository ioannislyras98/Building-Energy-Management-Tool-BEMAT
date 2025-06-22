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
    Write-Host "  3. Clean Docker & Rebuild All" -ForegroundColor Magenta
    Write-Host "  4. System Diagnostics" -ForegroundColor Blue
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

function Invoke-CleanDockerAndRebuild {
    Write-Host ""
    Write-Host "Clean Docker & Rebuild All" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "This will:" -ForegroundColor Yellow
    Write-Host "- Stop all containers" -ForegroundColor White
    Write-Host "- Remove all containers" -ForegroundColor White
    Write-Host "- Remove all images" -ForegroundColor White
    Write-Host "- Clean Docker cache and volumes" -ForegroundColor White
    Write-Host "- Rebuild everything from scratch" -ForegroundColor White
    Write-Host ""
    $confirm = Read-Host "Are you sure? This will take several minutes (y/N)"
    
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Operation cancelled" -ForegroundColor Yellow
        Read-Host "Press Enter to return to menu"
        return
    }
    
    if (!(Test-Docker)) { return }
    
    Write-Host ""
    Write-Host "Step 1: Stopping all containers..." -ForegroundColor Yellow
    try {
        docker stop $(docker ps -aq) 2>$null
        Write-Host "All containers stopped" -ForegroundColor Green
    }
    catch {
        Write-Host "No containers to stop" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "Step 2: Removing all containers..." -ForegroundColor Yellow
    try {
        docker rm $(docker ps -aq) 2>$null
        Write-Host "All containers removed" -ForegroundColor Green
    }
    catch {
        Write-Host "No containers to remove" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "Step 3: Removing all images..." -ForegroundColor Yellow
    try {
        docker rmi $(docker images -q) -f 2>$null
        Write-Host "All images removed" -ForegroundColor Green
    }
    catch {
        Write-Host "No images to remove" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "Step 4: Cleaning Docker cache and volumes..." -ForegroundColor Yellow
    try {
        docker system prune -af --volumes 2>$null
        Write-Host "Docker cache cleaned" -ForegroundColor Green
    }
    catch {
        Write-Host "Error cleaning cache" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Step 5: Rebuilding everything from scratch..." -ForegroundColor Yellow
    Write-Host "This will take several minutes..." -ForegroundColor Cyan
    
    # Build backend
    Write-Host ""
    Write-Host "Building backend..." -ForegroundColor Yellow
    Set-Location "$PSScriptRoot\backend"
    docker-compose up -d --build --force-recreate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Backend built successfully" -ForegroundColor Green
    } else {
        Write-Host "Backend build failed" -ForegroundColor Red
        Set-Location $PSScriptRoot
        Read-Host "Press Enter to return to menu"
        return
    }
    
    # Build frontend
    Write-Host ""
    Write-Host "Building frontend..." -ForegroundColor Yellow
    Set-Location "$PSScriptRoot\frontend"
    docker-compose -f docker-compose.frontend.yml up -d --build --force-recreate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Frontend built successfully" -ForegroundColor Green
    } else {
        Write-Host "Frontend build failed" -ForegroundColor Red
        Set-Location $PSScriptRoot
        Read-Host "Press Enter to return to menu"
        return
    }
    
    Set-Location $PSScriptRoot
    
    Write-Host ""
    Write-Host "CLEAN REBUILD COMPLETED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services are now running fresh:" -ForegroundColor Green
    Write-Host "- Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "- Backend:  http://localhost:8000" -ForegroundColor White
    Write-Host ""
    
    $openBrowser = Read-Host "Open browsers? (Y/n)"
    if ($openBrowser -ne "n" -and $openBrowser -ne "N") {
        Open-Browsers
    }
    
    Read-Host "Press Enter to return to menu"
}

function Show-Diagnostics {
    Write-Host ""
    Write-Host "System Diagnostics" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Running full system diagnostics..." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "System Information:" -ForegroundColor Yellow
    Write-Host "OS: $env:OS" -ForegroundColor White
    Write-Host "Processor: $env:PROCESSOR_ARCHITECTURE" -ForegroundColor White
    Write-Host ""
    
    # Check disk space
    try {
        $drive = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
        $freeGB = [math]::Round($drive.FreeSpace / 1GB, 2)
        $totalGB = [math]::Round($drive.Size / 1GB, 2)
        Write-Host "C: Drive: $freeGB GB free of $totalGB GB total" -ForegroundColor White
    }
    catch {
        Write-Host "Could not get disk space information" -ForegroundColor Yellow
    }
    Write-Host ""
    
    # Test Docker
    Write-Host "Docker Status:" -ForegroundColor Yellow
    if (Test-Docker) {
        Write-Host "Docker is running" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "Docker Containers:" -ForegroundColor Yellow
        try {
            docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        }
        catch {
            Write-Host "No containers running" -ForegroundColor Gray
        }
        
        Write-Host ""
        Write-Host "Docker Images:" -ForegroundColor Yellow
        try {
            docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
        }
        catch {
            Write-Host "No images found" -ForegroundColor Gray
        }
        
        Write-Host ""
        Write-Host "Docker System Usage:" -ForegroundColor Yellow
        try {
            docker system df
        }
        catch {
            Write-Host "Cannot get Docker system info" -ForegroundColor Red
        }
    } else {
        Write-Host "Docker is not running" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Port Status:" -ForegroundColor Yellow
    $ports = @(3000, 8000, 5432)
    foreach ($port in $ports) {
        $connections = netstat -ano | Select-String ":$port"
        if ($connections) {
            Write-Host "Port $port : IN USE" -ForegroundColor Red
        } else {
            Write-Host "Port $port : FREE" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "Diagnostics complete" -ForegroundColor Green
}

# Main script loop
$Host.UI.RawUI.WindowTitle = "BEMAT Control Center"

do {
    Show-Menu
    $choice = Read-Host "Choose option (0-4)"
    
    switch ($choice) {
        "1" { Start-BEMAT }
        "2" { Stop-AllServices }
        "3" { Invoke-CleanDockerAndRebuild }
        "4" { 
            Show-Diagnostics
            Read-Host "Press Enter to return to menu"
        }
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
