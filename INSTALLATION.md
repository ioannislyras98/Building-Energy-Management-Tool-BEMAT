# BEMAT Installation Guide 🛠️

Πλήρης οδηγός εγκατάστασης για το Building Energy Management Tool (BEMAT)

## 📋 Προαπαιτούμενα

### 1. Docker Desktop
- **Κατεβάστε από:** https://www.docker.com/products/docker-desktop
- **Minimum Requirements:** 4GB RAM, 64-bit processor
- **Έλεγχος:** `docker --version` && `docker-compose --version`

### 2. Git
- **Κατεβάστε από:** https://git-scm.com/download/win
- **Έλεγχος:** `git --version`

### 3. Ελεύθερα Ports
- **3000** - Frontend (React)
- **8000** - Backend API (Django)
- **5432** - Database (PostgreSQL)

## 🚀 Γρήγορη Εγκατάσταση (Recommended)

### Βήμα 1: Κλωνοποίηση
```bash
git clone https://github.com/your-username/Building-Energy-Management-Tool-BEMAT.git
cd Building-Energy-Management-Tool-BEMAT
```

### Βήμα 2: Εκτέλεση
```cmd
# Για Windows
start-bemat.bat

# Αναμένετε 1-2 λεπτά για το build
# Τα browsers θα ανοίξουν αυτόματα!
```

### Βήμα 3: Verify
- **Frontend:** http://localhost:3000 ✅
- **Backend:** http://localhost:8000 ✅
- **Admin:** http://localhost:8000/admin ✅

## 🔧 Manual Installation (Advanced)

### Backend Setup
```bash
cd backend

# Development
docker-compose up -d --build
docker-compose exec web python manage.py migrate --noinput

# Create admin user (προαιρετικό)
docker-compose exec web python manage.py createsuperuser
```

### Frontend Setup
```bash
cd frontend

# Build and run
docker-compose -f docker-compose.frontend.yml up -d --build
```

## 🛠️ Configuration Files

### Backend Environment (.env.dev)
```env
DEBUG=1
SECRET_KEY=your-secret-key-here
DJANGO_ALLOWED_HOSTS=localhost 127.0.0.1 [::1]
SQL_ENGINE=django.db.backends.postgresql
SQL_DATABASE=backend_dev
SQL_USER=backend
SQL_PASSWORD=backend
SQL_HOST=db
SQL_PORT=5432
DATABASE=postgres
```

### Frontend Configuration (vite.config.js)
```javascript
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true
    }
  },
  plugins: [
    react(),
    tailwindcss(),
  ]
})
```

## 🐛 Troubleshooting

### Common Issues

#### "Docker not found"
```bash
# Βεβαιωθείτε ότι το Docker Desktop τρέχει
# Windows: Αναζητήστε "Docker Desktop" στο Start Menu
```

#### "Port already in use"
```bash
# Βρείτε ποια εφαρμογή χρησιμοποιεί το port
netstat -ano | findstr :3000

# Τερματίστε την διεργασία
taskkill /PID <PID_NUMBER> /F
```

#### "Container exits immediately"
```bash
# Δείτε τα logs
docker-compose logs web
docker-compose -f frontend/docker-compose.frontend.yml logs frontend
```

#### "npm install fails"
```bash
# Καθαρίστε και ξαναχτίστε
cd frontend
docker-compose -f docker-compose.frontend.yml down
docker-compose -f docker-compose.frontend.yml up --build
```

### Advanced Troubleshooting

#### Complete Docker Reset
```bash
# Σταματήστε όλα
stop-all.bat

# Καθαρίστε το Docker
docker system prune -a -f
docker volume prune -f

# Ξεκινήστε ξανά
start-bemat.bat
```

#### Manual Container Management
```bash
# Δείτε όλα τα containers
docker ps -a

# Μπείτε σε container
docker exec -it backend-web-1 bash
docker exec -it frontend-frontend-1 sh

# Restart container
docker restart backend-web-1
```

## 📊 System Requirements

### Minimum:
- **OS:** Windows 10/11, macOS 10.15+, Linux
- **RAM:** 4GB
- **Storage:** 2GB free space
- **CPU:** 64-bit processor

### Recommended:
- **RAM:** 8GB+
- **Storage:** 5GB+ free space
- **Internet:** For Docker image downloads

## 🔒 Security Considerations

### Development:
- Default passwords είναι για development μόνο
- DEBUG=1 δεν πρέπει να χρησιμοποιείται σε production

### Production:
- Αλλάξτε όλα τα default passwords
- Δημιουργήστε νέο SECRET_KEY
- Ρυθμίστε HTTPS
- Ρυθμίστε firewall rules

## 📚 Next Steps

1. **Δημιουργία Admin User:**
   ```bash
   docker exec -it backend-web-1 bash
   python manage.py createsuperuser
   ```

2. **Πρόσβαση στο Admin Panel:**
   - URL: http://localhost:8000/admin
   - Login με τα στοιχεία που δημιουργήσατε

3. **Ανάπτυξη:**
   - Frontend code: `frontend/src/`
   - Backend code: `backend/app/`
   - Hot reload ενεργοποιημένο σε development mode

## 🆘 Support

### Αν χρειάζεστε βοήθεια:
1. Ελέγξτε το [Troubleshooting](#-troubleshooting) section
2. Δείτε τα logs: `docker-compose logs`
3. Ανοίξτε Issue στο GitHub repository

---

**🎉 Happy Coding με το BEMAT!**
