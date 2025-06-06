# Building Energy Management Tool (BEMAT)

Software for Building Energy Management Support - Integrated application with Django Backend & React Frontend

## Quick Start

### Step 1: Prerequisites

- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Start Docker Desktop and wait for it to load completely
- Install [Git](https://git-scm.com/downloads) (if you don't have it)

### Step 2: Clone

```bash
git clone https://github.com/your-username/Building-Energy-Management-Tool-BEMAT.git
cd Building-Energy-Management-Tool-BEMAT
```

### Step 3: Run

**PowerShell (Recommended):**
```powershell
.\bemat.ps1
```

**That's it!** The script will give you options for:

- **Quick Start** - Fast startup (recommended)
- **Advanced Start** - With diagnostics for troubleshooting  
- **Development Mode** - For debugging
- **Fix Dependencies** - Fix installation issues
- **System Status** - Check system status
- **Clean Reset** - Clean and restart

**Automatic features:**
- Starts all services (Backend + Frontend + Database)
- Opens browsers at correct URLs
- Installs dependencies
- Runs database migrations
- Health checking (waits until ready, 3-15 minutes)

## URLs after startup

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **API Documentation**: http://localhost:8000/api/docs/
- **Database**: PostgreSQL (port 5432)

## 🛠️ Προαπαιτούμενα

- ✅ **Docker Desktop** εγκατεστημένο και ενεργό
- ✅ **Git** (για κλωνοποίηση)
- ✅ **Windows** (τα scripts είναι για Windows)
- ✅ Διαθέσιμα ports: 3000, 8000, 5432

### Έλεγχος Προαπαιτούμενων

```powershell
# Έλεγχος Docker
docker --version

# Έλεγχος διαθέσιμων ports
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

## 🔧 Αντιμετώπιση Προβλημάτων

### Συνήθη Προβλήματα

1. **"Failed to resolve import" errors**
   - Χρησιμοποιήστε επιλογή 4 (Fix Dependencies) από το `bemat.ps1`

2. **Containers δεν ξεκινούν**
   - Χρησιμοποιήστε επιλογή 2 (Advanced Start) για διαγνωστικά
   - Ελέγξτε ότι το Docker Desktop τρέχει

3. **Port conflicts**
   - Χρησιμοποιήστε επιλογή 6 (System Status) για έλεγχο
   - Σταματήστε εφαρμογές που χρησιμοποιούν τα ports

4. **Frontend crashes after clone**
   - Χρησιμοποιήστε επιλογή 7 (Clean Reset)

5. **Performance issues**
   - Χρησιμοποιήστε επιλογή 5 (Rebuild Everything)

### Καθαρισμός Docker

```cmd
# Από το bemat.ps1 → επιλογή 7 (Clean Reset)
.\bemat.ps1

# Ή manual
docker system prune -a -f
docker volume prune -f
```

## 📚 Χειροκίνητη Εκτέλεση (Advanced Users)

Αν θέλετε να τρέξετε τα components χειροκίνητα:

### Backend Development

```bash
cd backend
docker-compose up -d --build
docker-compose exec web python manage.py migrate --noinput
```

### Frontend

```bash
cd frontend
docker-compose -f docker-compose.frontend.yml up -d --build
```

## 👤 Δημιουργία Admin User

```bash
# Μπες στο web container
docker exec -it backend-web-1 bash

# Δημιούργησε superuser
python manage.py createsuperuser
```

## 🗄️ Διαχείριση Database

### Σύνδεση στη βάση

```bash
docker-compose exec db psql --username=backend --dbname=backend_dev
```

### Νέος πίνακας (Django App)

```bash
# Μπες στο container
docker exec -it backend-web-1 bash

# Δημιούργησε νέα app
python manage.py startapp myapp

# Μετά τις αλλαγές στα models
python manage.py makemigrations myapp
python manage.py migrate
```

## 🎯 Χρήσιμες Εντολές

### Έλεγχος κατάστασης containers

```powershell
docker ps -a
```

### Παρακολούθηση logs

```powershell
# Backend
cd backend
docker-compose logs -f web

# Frontend
cd frontend
docker-compose -f docker-compose.frontend.yml logs -f frontend

# Or use development mode from bemat.ps1 for real-time logs
```

### Μπες σε container

```powershell
# Backend
docker exec -it backend-web-1 bash

# Frontend
docker exec -it frontend-frontend-1 sh
```

## 🏗️ Αρχιτεκτονική

```
BEMAT/
├── bemat.ps1             # Κεντρικό script ελέγχου
├── scripts/              # Όλα τα utility scripts
├── backend/              # Django REST API
│   ├── app/             # Django εφαρμογή
│   │   ├── backend/     # Core settings
│   │   ├── building/    # Building models
│   │   ├── user/        # User management
│   │   └── ...          # Other Django apps
│   └── docker-compose.yml
├── frontend/            # React + Vite + TailwindCSS
│   ├── src/            # React components
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── docker-compose.frontend.yml
└── README.md
```

## 📦 Tech Stack

**Backend:**

- Django 4.2.3
- Django REST Framework 3.15.2
- PostgreSQL 15
- Gunicorn 21.2.0

**Frontend:**

- React 18.2
- Vite 5.x (Build tool)
- TailwindCSS 3.4
- Material-UI (MUI) 5.x
- Axios (HTTP client)
- React Router DOM 7.x

**DevOps:**

- Docker & Docker Compose
- Automated batch scripts
- Auto browser opening
- Health checking

## 🏆 Best Practices

1. **Πάντα χρησιμοποιείτε `bemat.ps1` για όλες τις λειτουργίες**
2. **Επιλέξτε "Stop All Services" πριν κλείσετε τον υπολογιστή**
3. **Τρέξτε καθαρισμό Docker μία φορά την εβδομάδα** (επιλογή 7)
4. **Αν έχετε προβλήματα, χρησιμοποιήστε "Advanced Start" για διαγνωστικά**
5. **Κρατήστε το Docker Desktop ενημερωμένο**

## 🎉 Έτοιμο για χρήση!

**Για άμεση εκκίνηση:** Απλά τρέξτε `.\bemat.ps1` και επιλέξτε "1" για Quick Start!

**Για προχωρημένη διαχείριση:** Το ίδιο script σας δίνει όλες τις επιλογές.

**Για troubleshooting:** Επιλέξτε "2" για Advanced Start με διαγνωστικά.

## 📄 Πληροφορίες

1. [Κλιματικές Ζώνες](https://www.monodomiki.gr/ell/blog-details/klimatikes-zones-kai-oria-syntelesti-thermoperatotitas)

## 📄 Άδεια

Αυτό το project είναι ανοιχτού κώδικα και διαθέσιμο κάτω από την MIT License.
