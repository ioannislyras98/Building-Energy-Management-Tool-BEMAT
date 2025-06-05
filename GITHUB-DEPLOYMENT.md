# 🚀 GitHub Deployment Guide for BEMAT

This guide will help you deploy the Building Energy Management Tool (BEMAT) using GitHub and Docker.

## 📋 Prerequisites

### System Requirements
- **Operating System**: Windows 10/11, macOS, or Linux
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: At least 10GB free space
- **Network**: Internet connection for downloading dependencies

### Required Software
1. **Docker Desktop**
   - Download: https://www.docker.com/products/docker-desktop/
   - Make sure Docker Desktop is running before starting the application

2. **Git**
   - Download: https://git-scm.com/downloads
   - Required for cloning the repository

3. **Modern Web Browser**
   - Chrome, Firefox, Safari, or Edge (latest versions)

## 🔄 Deployment Steps

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/Building-Energy-Management-Tool-BEMAT.git

# Navigate to the project directory
cd Building-Energy-Management-Tool-BEMAT
```

### Step 2: Start Docker Desktop

1. Launch Docker Desktop application
2. Wait for the Docker daemon to start completely
3. Verify Docker is running by opening a terminal and typing:
   ```bash
   docker --version
   ```

### Step 3: Quick Start (Windows)

**Recommended:** Use the smart launcher that automatically waits for services:
```cmd
start-bemat.bat
```

This script will automatically:
- ✅ Check Docker is running
- ✅ Start PostgreSQL database
- ✅ Start Django backend API
- ✅ Install frontend dependencies
- ✅ Start React frontend
- ✅ **Monitor services for up to 10 minutes**
- ✅ **Show detailed progress and error messages**
- ✅ Open browsers only when services respond

**⏱️ Startup Time:** 
- First run: 5-8 minutes (downloading images)
- Subsequent runs: 1-3 minutes

**Note**: The script provides real-time feedback, error detection, and ensures browsers open only when services are ready, preventing "connection refused" errors.

### Step 4: Manual Start (Cross-Platform)

If you're on macOS/Linux or prefer manual control:

```bash
# Start Backend Services
cd backend
docker-compose up -d --build

# Wait for backend to be ready (about 30 seconds)
# Then start Frontend
cd ../frontend
docker-compose -f docker-compose.frontend.yml up -d --build
```

## 🌐 Access the Application

Once deployment is complete, access these URLs:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | React application (main interface) |
| **Backend API** | http://localhost:8000 | Django REST API |
| **Admin Panel** | http://localhost:8000/admin | Django admin interface |
| **API Documentation** | http://localhost:8000/api/docs/ | API documentation |

## 👤 Initial Setup

### Create Admin User

```bash
# Enter the backend container
docker exec -it backend-web-1 bash

# Create superuser
python manage.py createsuperuser

# Follow the prompts to set username, email, and password
```

### First Login

1. Go to http://localhost:3000
2. Click "Sign Up" to create a new account
3. Or use the admin credentials at http://localhost:8000/admin

## 🔧 Troubleshooting

### Common Issues

#### 1. Docker not running
**Error**: `docker: command not found` or connection errors

**Solution**:
- Ensure Docker Desktop is installed and running
- Restart Docker Desktop if it's not responding
- Check Docker status: `docker info`

#### 2. Port conflicts
**Error**: `Port already in use`

**Solution**:
```bash
# Check what's using the ports
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Stop conflicting services or change ports in docker-compose files
```

#### 3. Frontend dependencies not installing
**Error**: Module not found or build failures

**Solution**:
```cmd
# Use the rebuild script to force fresh installation
rebuild-containers.bat
```

#### 4. Database connection issues
**Error**: `could not connect to server`

**Solution**:
```bash
# Reset database container
docker-compose down
docker volume prune -f
docker-compose up -d --build
```

### Logs and Debugging

```bash
# View backend logs
cd backend
docker-compose logs web

# View frontend logs  
cd frontend
docker-compose -f docker-compose.frontend.yml logs frontend

# View database logs
cd backend
docker-compose logs db
```

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild containers with updates
rebuild-containers.bat   # Windows
# or manual rebuild:
docker-compose down
docker-compose up --build
```

### Stopping the Application

```bash
# Windows - Use the stop script
stop-all.bat

# Manual stop
cd backend
docker-compose down
cd ../frontend
docker-compose -f docker-compose.frontend.yml down
```

### Cleaning Docker Resources

```bash
# Remove unused containers, networks, images
docker system prune -a

# Remove volumes (⚠️ This will delete database data)
docker volume prune
```

## 📊 Architecture Overview

```
BEMAT Application
├── Frontend (React + Vite)     → Port 3000
├── Backend (Django)            → Port 8000
└── Database (PostgreSQL)       → Port 5432
```

## 📞 Support

### Getting Help

1. **Check the logs** first using the commands above
2. **Restart Docker Desktop** if containers won't start
3. **Run the rebuild script** if dependencies are causing issues
4. **Open an issue** on GitHub with:
   - Your operating system
   - Docker version
   - Error messages
   - Steps you've tried

### Useful Commands

```bash
# Check running containers
docker ps

# Check all containers
docker ps -a

# Check Docker images
docker images

# Free up space
docker system df
docker system prune -a
```

---

**Quick Start Summary**: Install Docker Desktop → Clone repo → Run `start-bemat.bat` → Open http://localhost:3000 🎉
