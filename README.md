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

✅ Αυτόματα ξεκινούν όλα τα services  
✅ Ανοίγουν τα browsers στο Frontend & Backend  
✅ Γίνεται npm install για το frontend  
✅ Εκτελούνται οι migrations

## 📋 Διαθέσιμες Λειτουργίες

| Επιλογή | Περιγραφή         | Browser Auto-Open | Πότε να χρησιμοποιηθεί |
| ------- | ----------------- | ----------------- | ---------------------- |
| `1`     | Start BEMAT       | ✅                | Καθημερινή χρήση       |
| `2`     | Stop All Services | ❌                | Τέλος εργασίας         |
| `0`     | Exit              | ❌                | Έξοδος από το script   |

### 🔧 Επιλογή της κατάλληλης λειτουργίας:

- **Νέος χρήστης**: Επιλογή `1` - Start BEMAT (συνιστάται)
- **Τέλος εργασίας**: Επιλογή `2` - Stop All Services

## ⚙️ Τι κάνει το BEMAT Control Center

### bemat.ps1

Το κεντρικό script που παρέχει ένα απλό μενού με επιλογές:

**Επιλογή 1 - Start BEMAT:**

- 🔨 Ελέγχει αν το Docker τρέχει
- 🔨 Χτίζει το backend (Django API + PostgreSQL) πρώτα
- 🔨 Χτίζει το frontend (React/Vite) δεύτερο **με npm install**
- 🌐 **Αυτόματα ανοίγει τα browsers** στο Frontend & Backend

**Επιλογή 2 - Stop All Services:**

- 🛑 Σταματά όλα τα running containers
- 🧹 Καθαρό κλείσιμο όλων των services

## 🌐 URLs μετά την εκκίνηση

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

   - Χρησιμοποιήστε `.\bemat.ps1` -> επιλογή "2" (Stop All Services) και μετά επιλογή "1" (Start BEMAT) για fresh start

2. **Containers δεν ξεκινούν**

   - Ελέγξτε ότι το Docker Desktop τρέχει
   - Τρέξτε `.\bemat.ps1` -> επιλογή "2" και μετά επιλογή "1"

3. **Port conflicts**

   - Σταματήστε εφαρμογές που χρησιμοποιούν τα ports (3000, 8000, 5432)
   - Χρησιμοποιήστε `netstat -ano | findstr :PORT` για έλεγχο

4. **Frontend crashes after clone**

   - Τρέξτε `.\bemat.ps1` -> επιλογή "2" και μετά επιλογή "1"

5. **Performance issues**
   - Κάντε καθαρισμό Docker και fresh restart

### Καθαρισμός Docker

```powershell
# Σταματήστε όλα τα services πρώτα
.\bemat.ps1
# Επιλέξτε "2" - Stop All Services

# Καθαρισμός Docker
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
- PowerShell automation script
- Auto browser opening

## 🏆 Best Practices

1. **Πάντα χρησιμοποιείτε `.\bemat.ps1` για εκκίνηση**
2. **Επιλέξτε "Stop All Services" (2) πριν κλείσετε τον υπολογιστή**
3. **Τρέξτε καθαρισμό Docker αν έχετε προβλήματα**
4. **Κρατήστε το Docker Desktop ενημερωμένο**

## 🎉 Έτοιμο για χρήση!

**Για άμεση εκκίνηση:** Απλά τρέξτε `.\bemat.ps1` και επιλέξτε "1"

**Για σταμάτημα:** Τρέξτε `.\bemat.ps1` και επιλέξτε "2"

## 📄 Πληροφορίες

1. [Κλιματικές Ζώνες](https://www.monodomiki.gr/ell/blog-details/klimatikes-zones-kai-oria-syntelesti-thermoperatotitas)

## 📄 Άδεια

Αυτό το project είναι ανοιχτού κώδικα και διαθέσιμο κάτω από την MIT License.
