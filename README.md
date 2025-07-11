# Building Energy Management Tool (BEMAT)

Software for Building Energy Management Support - Integrated application with Django Backend & React Frontend

## 🌐 Cross-Platform Support

**BEMAT τρέχει σε όλα τα λειτουργικά συστήματα:**

| Platform    | Script         | Status                               |
| ----------- | -------------- | ------------------------------------ |
| **Windows** | `bemat.ps1`    | ✅ Full automation + browser opening |
| **Linux**   | `bemat.sh`     | ✅ Full automation + browser opening |
| **macOS**   | `bemat.sh`     | ✅ Full automation + browser opening |
| **Manual**  | Docker Compose | ✅ All platforms                     |

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

#### Windows

```powershell
# Εκκίνηση BEMAT Control Center
.\bemat.ps1
```

#### Linux/macOS

```bash
# Make script executable (first time only)
chmod +x bemat.sh

# Εκκίνηση BEMAT Control Center
./bemat.sh
```

**Αυτόματες λειτουργίες:**

1. Αυτόματα ξεκινούν όλα τα services
2. Ανοίγουν τα browsers στο Frontend & Backend (Windows/Linux/macOS)
3. Γίνεται npm install για το frontend
4. Εκτελούνται οι migrations με σωστή σειρά

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

## URLs μετά την εκκίνηση

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **API Documentation**: http://localhost:8000/api/docs/
- **Database**: PostgreSQL (port 5432)

## Προαπαιτούμενα

- ✅ **Docker Desktop** εγκατεστημένο και ενεργό
- ✅ **Git** (για κλωνοποίηση)
- ✅ **Cross-Platform Support**: Windows, Linux, macOS
- ✅ Διαθέσιμα ports: 3000, 8000, 5432

### Platform-specific:

- **Windows**: PowerShell scripts (bemat.ps1)
- **Linux/macOS**: Bash scripts (bemat.sh)

### Έλεγχος Προαπαιτούμενων

**Windows:**

```powershell
# Έλεγχος Docker
docker --version

# Έλεγχος διαθέσιμων ports
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

**Linux/macOS:**

```bash
# Έλεγχος Docker
docker --version

# Έλεγχος διαθέσιμων ports
lsof -i :3000
lsof -i :8000
```

### Καθαρισμός Docker

**Windows:**

```powershell
# Σταματήστε όλα τα services πρώτα
.\bemat.ps1
# Επιλέξτε "2" - Stop All Services

# Καθαρισμός Docker
docker system prune -a -f
docker volume prune -f
```

**Linux/macOS:**

```bash
# Σταματήστε όλα τα services πρώτα
./bemat.sh
# Επιλέξτε "2" - Stop All Services

# Καθαρισμός Docker
docker system prune -a -f
docker volume prune -f
```

## Χειροκίνητη Εκτέλεση (Advanced Users)

#### Backend & Database

```bash
cd backend
docker-compose up --build -d
```

#### Frontend

```bash
cd frontend
docker-compose -f docker-compose.frontend.yml up --build -d
```

### Δημιουργία Superuser (όλα τα platforms)

```bash
# Δημιουργία admin user
docker-compose exec web python manage.py createsuperuser
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

### Έλεγχος κατάστασης containers (όλα τα platforms)

```bash
docker ps -a
docker-compose ps
```

### Παρακολούθηση logs

**Windows (PowerShell):**

```powershell
# Backend
cd backend
docker-compose logs -f web

# Frontend
cd frontend
docker-compose -f docker-compose.frontend.yml logs -f frontend
```

**Linux/macOS (Bash):**

```bash
# Backend
cd backend
docker-compose logs -f web

# Frontend
cd frontend
docker-compose -f docker-compose.frontend.yml logs -f frontend
```

### Μπες σε container

```bash
# Backend (όλα τα platforms)
docker exec -it backend-web-1 bash

# Frontend (όλα τα platforms)
docker exec -it frontend-frontend-1 sh
```

### Καθαρισμός Docker (όλα τα platforms)

```bash
# Σταματήστε όλα τα services πρώτα
docker-compose down
cd ../frontend && docker-compose -f docker-compose.frontend.yml down

# Καθαρισμός Docker
docker system prune -a -f
docker volume prune -f
```

## Αρχιτεκτονική

```
BEMAT/
├── bemat.ps1             # Κύριο PowerShell script εκκίνησης & διαχείρισης (Windows)
├── bemat.sh              # Κύριο Bash script εκκίνησης & διαχείρισης (Linux/macOS)
├── backend/              # Django REST API
│   ├── app/             # Django εφαρμογή
│   │   ├── backend/     # Core settings
│   │   ├── building/    # Building models
│   │   ├── user/        # User management
│   │   ├── entrypoint.sh # Cross-platform startup script
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
- Cross-platform automation scripts (Windows/Linux/macOS)
- Auto browser opening

## Πληροφορίες

1. [Κλιματικές Ζώνες](https://www.monodomiki.gr/ell/blog-details/klimatikes-zones-kai-oria-syntelesti-thermoperatotitas)
2. [Κλιματικές Ζώνες,τιμες θερμοκρασίας πινακας Α1 για τον υπολογισμο απωλειων σε kw(τωρα εχω βαλει ενδεικτικα διαφορα μεσα εξω ανα εποχη)](https://portal.tee.gr/portal/page/portal/tptee/totee/TOTEE-20701-3-Final-TEE%203nd%20Edition.pdf?utm_source=chatgpt.com)
3. [Οδηγός θερμομόνωσης κτηρίων (Επιφανειακες αντιστασεις σελ 30 pdf 16)](https://www.kalivis.gr/uploads/20161019article_H_Shmasia_Tis_Thermomonosis_Ton_Ktirion/ODIGOS%20THERMOMONOSIS%20KTIRION_DEC2007.pdf)
4. [Υλικά και συντελεστής θερμικής αγωγιμότητας λ(Συγκριτικός Πίνακας Συντελεστών Διαφορετικών Δομικών Υλικών
   )](https://www.wands.gr/el/faq/oikonomia-apo-tin-thermomonosi)
