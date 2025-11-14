#!/bin/bash

# Building Energy Management Tool (BEMAT) - Linux/macOS Control Script
# Cross-platform version of bemat.ps1

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_status "Docker is running ✓"
}

# Function to check if ports are available
check_ports() {
    local ports=(3000 8000 5432)
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "Port $port is already in use"
        else
            print_status "Port $port is available ✓"
        fi
    done
}

# Function to start BEMAT services
start_bemat() {
    local mode=${1:-dev}
    
    if [ "$mode" = "prod" ]; then
        print_header "🚀 Starting BEMAT Services (PRODUCTION MODE)..."
        print_status "Backend: Gunicorn | Frontend: Nginx"
    else
        print_header "🚀 Starting BEMAT Services (DEVELOPMENT MODE)..."
        print_status "Backend: Django runserver | Frontend: Vite dev server"
    fi
    
    check_docker
    check_ports
    
    # Start backend
    if [ "$mode" = "prod" ]; then
        print_status "Building and starting Backend (PRODUCTION - Django + Gunicorn + PostgreSQL)..."
        cd backend
        docker compose -f docker-compose.prod.yml up --build -d
    else
        print_status "Building and starting Backend (DEVELOPMENT - Django + PostgreSQL)..."
        cd backend
        docker compose up --build -d
    fi
    
    # Wait for backend to be ready
    print_status "Waiting for backend to be ready..."
    sleep 30
    
    # Start frontend
    if [ "$mode" = "prod" ]; then
        print_status "Building and starting Frontend (PRODUCTION - React + Nginx)..."
        cd ../frontend
        docker compose -f docker-compose.frontend.prod.yml up --build -d
    else
        print_status "Building and starting Frontend (DEVELOPMENT - React + Vite)..."
        cd ../frontend
        docker compose -f docker-compose.frontend.yml up --build -d
    fi
    
    # Wait a bit for frontend to start
    sleep 10
    
    print_status "✅ BEMAT is now running!"
    echo ""
    print_header "📱 Access URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo "   Admin Panel: http://localhost:8000/admin"
    echo ""
    
    if [ "$mode" = "prod" ]; then
        print_header "🔧 Production Mode Active:"
        echo "   Backend: Gunicorn (multi-worker)"
        echo "   Frontend: Nginx (optimized static files)"
        echo "   DEBUG: False"
    fi
    echo ""
    
    # Try to open browsers if available
    if command -v xdg-open > /dev/null; then
        # Linux
        xdg-open http://localhost:3000 > /dev/null 2>&1 &
        xdg-open http://localhost:8000 > /dev/null 2>&1 &
    elif command -v open > /dev/null; then
        # macOS
        open http://localhost:3000 > /dev/null 2>&1 &
        open http://localhost:8000 > /dev/null 2>&1 &
    else
        print_warning "Could not auto-open browsers. Please manually open:"
        print_warning "Frontend: http://localhost:3000"
        print_warning "Backend: http://localhost:8000"
    fi
    
    cd ..
}

# Function to stop all services
stop_services() {
    print_header "🛑 Stopping BEMAT Services..."
    
    cd backend
    docker compose down
    docker compose -f docker-compose.prod.yml down
    
    cd ../frontend
    docker compose -f docker-compose.frontend.yml down
    docker compose -f docker-compose.frontend.prod.yml down
    
    print_status "✅ All services stopped successfully!"
    cd ..
}

# Function to clean and rebuild everything
clean_rebuild() {
    print_header "🧹 Cleaning Docker and Rebuilding Everything..."
    
    print_warning "This will remove all Docker containers, images, and volumes!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Operation cancelled."
        return
    fi
    
    # Stop all services first
    stop_services
    
    print_status "Cleaning Docker system..."
    docker system prune -a -f
    docker volume prune -f
    
    print_status "Rebuilding everything from scratch..."
    start_bemat
}

# Function to show system diagnostics
system_diagnostics() {
    print_header "🔍 BEMAT System Diagnostics"
    echo ""
    
    print_header "System Information:"
    echo "OS: $(uname -s) $(uname -r)"
    echo "Architecture: $(uname -m)"
    echo "User: $(whoami)"
    echo ""
    
    print_header "Docker Information:"
    if docker info >/dev/null 2>&1; then
        echo "Docker Version: $(docker --version)"
        echo "Docker Compose Version: $(docker compose version)"
        echo "Docker Status: ✅ Running"
    else
        echo "Docker Status: ❌ Not Running"
    fi
    echo ""
    
    print_header "Container Status:"
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "No containers found"
    echo ""
    
    print_header "Port Usage:"
    local ports=(3000 8000 5432)
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo "Port $port: ❌ In Use"
        else
            echo "Port $port: ✅ Available"
        fi
    done
    echo ""
    
    print_header "Docker Usage:"
    docker system df 2>/dev/null || echo "Could not retrieve Docker usage information"
}

# Function to show menu
show_menu() {
    clear
    print_header "╔══════════════════════════════════════════════════════════════╗"
    print_header "║             🏢 BEMAT Control Center (Linux/macOS)             ║"
    print_header "║         Building Energy Management Tool Controller           ║"
    print_header "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Choose an option:"
    echo ""
    echo "1️⃣  Start BEMAT (Development)"
    echo "2️⃣  Start BEMAT (Production)"
    echo "3️⃣  Stop All Services"  
    echo "4️⃣  Clean Docker & Rebuild All"
    echo "5️⃣  System Diagnostics"
    echo "0️⃣  Exit"
    echo ""
    echo -n "Enter your choice (0-5): "
}

# Main script logic
main() {
    while true; do
        show_menu
        read -r choice
        echo ""
        
        case $choice in
            1)
                start_bemat "dev"
                read -p "Press Enter to continue..."
                ;;
            2)
                start_bemat "prod"
                read -p "Press Enter to continue..."
                ;;
            3)
                stop_services
                read -p "Press Enter to continue..."
                ;;
            4)
                clean_rebuild
                read -p "Press Enter to continue..."
                ;;
            5)
                system_diagnostics
                read -p "Press Enter to continue..."
                ;;
            0)
                print_status "👋 Thank you for using BEMAT!"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please choose 0-5."
                read -p "Press Enter to continue..."
                ;;
        esac
    done
}

# Check if script is run from the correct directory
if [[ ! -f "README.md" ]] || [[ ! -d "backend" ]] || [[ ! -d "frontend" ]]; then
    print_error "Please run this script from the BEMAT project root directory."
    print_error "Expected structure: backend/, frontend/, README.md"
    exit 1
fi

# Run main function
main
