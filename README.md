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

### **Βήμα 3**: Εκτέλεση με ένα κλικ

```cmd
# Γρήγορη εκκίνηση (συνιστάται)
start-bemat.bat

# Για προβλήματα με Docker/Ports
start-bemat-advanced.bat

# Για development με debugging
start-development.bat
```

✅ Αυτόματα ξεκινούν όλα τα services  
✅ Ανοίγουν τα browsers στο Frontend & Backend  
✅ Γίνεται npm install για το frontend  
✅ Εκτελούνται οι migrations  
✅ Health checking - περιμένει να είναι έτοιμα (3-15 λεπτά)

## 📋 Διαθέσιμα Scripts

| Script                     | Περιγραφή                            | Browser Auto-Open | Πότε να χρησιμοποιηθεί     |
| -------------------------- | ------------------------------------ | ----------------- | -------------------------- |
| `start-bemat.bat`          | Γρήγορη εκκίνηση με health checking  | ✅                | Καθημερινή χρήση           |
| `start-bemat-advanced.bat` | Εκκίνηση με έλεγχους και διαγνωστικά | ✅                | Προβλήματα με Docker/ports |
| `start-bemat-detached.bat` | Γρήγορη εκκίνηση χωρίς περιμονή      | ❌                | Όταν ξέρετε ότι δουλεύει   |
| `start-development.bat`    | Development με terminal windows      | ✅                | Debugging/development      |
| `rebuild-containers.bat`   | Ανακατασκευή από την αρχή            | ✅                | Προβλήματα dependencies    |
| `check-dependencies.bat`   | Έλεγχος dependencies                 | ❌                | Troubleshooting            |
| `docker-manager.bat`       | Κεντρικό menu διαχείρισης            | Varies            | Γενική διαχείριση          |
| `stop-all.bat`             | Σταματά όλα τα containers            | ❌                | Τέλος εργασίας             |

### 🔧 Επιλογή του κατάλληλου script:

- **Νέος χρήστης**: `start-bemat.bat` (συνιστάται)
- **Προβλήματα με ports/Docker**: `start-bemat-advanced.bat`
- **Γρήγορη εκκίνηση χωρίς περιμονή**: `start-bemat-detached.bat`
- **Προβλήματα με dependencies**: `rebuild-containers.bat` ή `check-dependencies.bat`
- **Development/debugging**: `start-development.bat`

## ⚙️ Τι κάνει κάθε script

### start-bemat.bat

- 🔨 Χτίζει το backend (Django API + PostgreSQL) σε background mode
- 🔨 Χτίζει το frontend (React/Vite) **με npm install**
- ⏱️ Health checking - περιμένει να είναι έτοιμα τα services (15 λεπτά max)
- 🌐 **Αυτόματα ανοίγει τα browsers** στο Frontend & Backend όταν είναι έτοιμα

### start-bemat-advanced.bat

- ✅ Ελέγχει αν το Docker Desktop τρέχει
- ✅ Σταματά τυχόν υπάρχοντα containers για clean start
- ✅ Ελέγχει διαθεσιμότητα ports (3000, 8000, 5432)
- ✅ Παρέχει προειδοποιήσεις για conflicts
- ✅ Περισσότερα διαγνωστικά μηνύματα
- ✅ Επιλογές διαχείρισης σε περίπτωση αποτυχίας

### start-bemat-detached.bat

- ⚡ Γρήγορη εκκίνηση χωρίς health checking
- 🔨 Χτίζει containers σε background mode
- ❌ Δεν περιμένει να είναι έτοιμα
- ❌ Δεν ανοίγει browsers αυτόματα

### start-development.bat

- 🔨 Development environment με hot reload
- 🖥️ Ανοίγει terminal windows για debugging
- 🌐 Ανοίγει: Frontend + Backend API
- ⏱️ Health checking για έτοιμα services

### check-dependencies.bat

- 📦 Ελέγχει dependencies στο backend και frontend
- 🔧 Εγκαθιστά missing dependencies αυτόματα
- ✅ Επαληθεύει ότι όλα είναι ενημερωμένα

### rebuild-containers.bat

- 🗑️ Διαγράφει παλιά containers και images
- 🔨 Ανακατασκευάζει από την αρχή
- 📦 Εγκαθιστά fresh dependencies
- 🌐 Ανοίγει browsers όταν τελειώσει

### docker-manager.bat

- 📋 Menu με όλες τις επιλογές
- 📊 Status check containers
- 🧹 Καθαρισμός Docker system
- ⏹️ Stop όλων των services

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
