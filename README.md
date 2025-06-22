# Building Energy Management Tool (BEMAT)

Software for Building Energy Management Support - Integrated application with Django Backend & React Frontend

## Quick Start

### Step 1: Prerequisites

- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Start Docker Desktop and wait for it to load completely
- Install [Git](https://git-scm.com/downloads) (if you don't have it)

### Step 2: Clone

```bash
git clone https://github.com/ioannislyras98/Building-Energy-Management-Tool-BEMAT.git
cd Building-Energy-Management-Tool-BEMAT
```

### **Βήμα 3**: Εκτέλεση με ένα κλικ

```powershell
# Εκκίνηση BEMAT Control Center
.\bemat.ps1
```

1. Αυτόματα ξεκινούν όλα τα services
2. Ανοίγουν τα browsers στο Frontend & Backend
3. Γίνεται npm install για το frontend
4. Εκτελούνται οι migrations

## 📋 Διαθέσιμες Λειτουργίες

| Επιλογή | Περιγραφή                  | Πότε να χρησιμοποιηθεί                   |
| ------- | -------------------------- | ---------------------------------------- |
| `1`     | Start BEMAT (Recommended)  | Καθημερινή χρήση                         |
| `2`     | Stop All Services          | Τέλος εργασίας                           |
| `3`     | Clean Docker & Rebuild All | Προβλήματα με cache, πλήρης επανεκκίνηση |
| `4`     | System Diagnostics         | Έλεγχος κατάστασης συστήματος            |
| `0`     | Exit                       | Έξοδος από το script                     |

### 🔧 Επιλογή της κατάλληλης λειτουργίας:

- **Νέος χρήστης**: Επιλογή `1` - Start BEMAT
- **Καθημερινή χρήση**: Επιλογή `1` - Start BEMAT
- **Προβλήματα με imports/cache**: Επιλογή `3` - Clean Docker & Rebuild All
- **Έλεγχος συστήματος**: Επιλογή `4` - System Diagnostics
- **Τέλος εργασίας**: Επιλογή `2` - Stop All Services

## Τι κάνει το BEMAT Control Center

### bemat.ps1

Το κεντρικό script που παρέχει ένα απλό μενού με επιλογές:

**Επιλογή 1 - Start BEMAT (Recommended):**

- Ελέγχει αν το Docker τρέχει
- Χτίζει το backend (Django API + PostgreSQL) πρώτα
- Χτίζει το frontend (React/Vite) δεύτερο **με npm install**
- **Αυτόματα ανοίγει τα browsers** στο Frontend & Backend

**Επιλογή 2 - Stop All Services:**

- Σταματά όλα τα running containers
- Καθαρό κλείσιμο όλων των services

**Επιλογή 3 - Clean Docker & Rebuild All:** 🧹

- **Σταματά όλα τα containers**
- **Διαγράφει όλα τα containers**
- **Διαγράφει όλα τα Docker images**
- **Καθαρίζει Docker cache και volumes**
- **Rebuild από την αρχή** - Backend και Frontend
- **Αυτόματα ανοίγει browsers** μετά το rebuild
- **Χρησιμοποιήστε όταν**: Έχετε προβλήματα με cache, import errors, ή θέλετε fresh start

**Επιλογή 4 - System Diagnostics:** 🔍

- **Εμφανίζει πληροφορίες συστήματος** (OS, CPU, Disk space)
- **Έλεγχος Docker status** και containers
- **Έλεγχος διαθέσιμων ports** (3000, 8000, 5432)
- **Docker system usage** (images, containers, volumes)
- **Χρησιμοποιήστε όταν**: Θέλετε να ελέγξετε την κατάσταση του συστήματος

## URLs μετά την εκκίνηση

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **API Documentation**: http://localhost:8000/api/docs/
- **Database**: PostgreSQL (port 5432)

## Προαπαιτούμενα

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


### Καθαρισμός Docker

```powershell
# Σταματήστε όλα τα services πρώτα
.\bemat.ps1
# Επιλέξτε "2" - Stop All Services

# Καθαρισμός Docker
docker system prune -a -f
docker volume prune -f
```

## Χειροκίνητη Εκτέλεση (Advanced Users)

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

## Δημιουργία Admin User

```bash
# Μπες στο web container
docker exec -it backend-web-1 bash

# Δημιούργησε superuser
python manage.py createsuperuser
```

## Διαχείριση Database

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

## Χρήσιμες Εντολές

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
```

### Μπες σε container

```powershell
# Backend
docker exec -it backend-web-1 bash

# Frontend
docker exec -it frontend-frontend-1 sh
```

## Αρχιτεκτονική

```
BEMAT/
├── bemat.ps1             # Κύριο PowerShell script εκκίνησης & διαχείρισης
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

## Tech Stack

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
- PowerShell automation script
- Auto browser opening

## Πληροφορίες

1. [Κλιματικές Ζώνες](https://www.monodomiki.gr/ell/blog-details/klimatikes-zones-kai-oria-syntelesti-thermoperatotitas)

## 🆕 Νέες Λειτουργίες v2.0

### 🧹 Clean Docker & Rebuild All (Επιλογή 3)

**Χρησιμοποιήστε όταν:**

- Έχετε `Module not found` ή `import errors`
- Το frontend δεν φορτώνει σωστά
- Cache προβλήματα με το browser
- Θέλετε fresh start από την αρχή
- Docker errors ή "out of disk space"

**Τι κάνει:**

- 🛑 Σταματά όλα τα containers
- 🗑️ Διαγράφει όλα τα containers
- 🗑️ Διαγράφει όλα τα Docker images
- 🧹 Καθαρίζει Docker cache και volumes
- 🔨 Rebuild backend από την αρχή
- 🔨 Rebuild frontend από την αρχή
- 🌐 Αυτόματα ανοίγει browsers

### 🔍 System Diagnostics (Επιλογή 4)

**Χρησιμοποιήστε όταν:**

- Θέλετε να δείτε την κατάσταση του συστήματος
- Έλεγχος αν τα ports είναι ελεύθερα
- Έλεγχος Docker containers και images
- Έλεγχος διαθέσιμου χώρου στο δίσκο

**Τι εμφανίζει:**

- 💻 Πληροφορίες συστήματος (OS, CPU)
- 💾 Διαθέσιμο χώρο στο δίσκο
- 🐳 Docker status και containers
- 🔌 Κατάσταση ports (3000, 8000, 5432)
- 📊 Docker system usage
