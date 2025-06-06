# Building Energy Management Tool (BEMAT) 🏢⚡

Λογισμικό Υποστήριξης Ενεργειακής Διαχείρισης Κτιρίων - Ολοκληρωμένη εφαρμογή με Django Backend & React Frontend

## 🚀 Γρήγορη Εκκίνηση (Recommended)

**Για άμεση εκτέλεση όλης της εφαρμογής:**

### **Βήμα 1**: Προαπαιτούμενα

- Εγκαταστήστε [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Εκκινήστε το Docker Desktop και περιμένετε να φορτώσει πλήρως
- Εγκαταστήστε [Git](https://git-scm.com/downloads) (εάν δεν το έχετε)

### **Βήμα 2**: Κλωνοποίηση

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

| Script                     | Περιγραφή                               | Browser Auto-Open | Πότε να χρησιμοποιηθεί     |
| -------------------------- | --------------------------------------- | ----------------- | -------------------------- |
| `start-bemat.bat`          | Γρήγορη εκκίνηση με health checking     | ✅                | Καθημερινή χρήση           |
| `start-bemat-advanced.bat` | Εκκίνηση με έλεγχους και διαγνωστικά    | ✅                | Προβλήματα με Docker/ports |
| `start-bemat-detached.bat` | Γρήγορη εκκίνηση χωρίς terminal windows | ❌                | Όταν ξέρετε ότι δουλεύει   |
| `start-development.bat`    | Development με terminal windows         | ✅                | Debugging/development      |
| `rebuild-containers.bat`   | Ανακατασκευή από την αρχή               | ✅                | Προβλήματα dependencies    |
| `check-dependencies.bat`   | Έλεγχος dependencies                    | ❌                | Troubleshooting            |
| `docker-manager.bat`       | Κεντρικό menu διαχείρισης               | Varies            | Γενική διαχείριση          |
| `stop-all.bat`             | Σταματά όλα τα containers               | ❌                | Τέλος εργασίας             |

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

- 🔨 Development environment
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

- **Frontend**: http://localhost:3000 🎨
- **Backend API**: http://localhost:8000 ⚙️
- **Admin Panel**: http://localhost:8000/admin 👤
- **API Documentation**: http://localhost:8000/api/docs/ 📚
- **Database**: PostgreSQL (port 5432) 🗄️

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

## 📚 Χειροκίνητη Εκτέλεση (Advanced)

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
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3000,
    watch: {
      usePolling: true,
    },
  },
  plugins: [react(), tailwindcss()],
});
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

## 🔧 Αντιμετώπιση Προβλημάτων

### 🚀 Advanced Startup (`start-bemat-advanced.bat`)

Το advanced script παρέχει επιπλέον διαγνωστικά και ελέγχους:

**Τι κάνει:**

- ✅ Ελέγχει αν το Docker Desktop τρέχει
- ✅ Σταματά τυχόν υπάρχοντα containers
- ✅ Ελέγχει διαθεσιμότητα ports (3000, 8000, 5432)
- ✅ Παρέχει προειδοποιήσεις για conflicts
- ✅ Δίνει επιλογές διαχείρισης σε περίπτωση αποτυχίας
- ✅ Περισσότερα διαγνωστικά μηνύματα

**Πότε να το χρησιμοποιήσετε:**

- Όταν το κανονικό `start-bemat.bat` αποτυγχάνει
- Όταν έχετε conflicts με ports
- Όταν θέλετε να δείτε λεπτομερή διαγνωστικά
- Για πρώτη φορά εγκατάσταση με προβλήματα

### Quick Troubleshooting Workflow

1. **First try**: `start-bemat-advanced.bat` (includes diagnostics)
2. **If dependencies issue**: `rebuild-containers.bat`
3. **If still problems**: `check-dependencies.bat`
4. **For clean restart**: `stop-all.bat` then `start-bemat.bat`

### Τα containers δεν ξεκινούν

1. Τρέξε `stop-all.bat`
2. Έλεγξε ότι το Docker Desktop τρέχει
3. Τρέξε ξανά `start-bemat-advanced.bat`

### Πρόβλημα με ports

```powershell
# Use advanced startup script for port checking
start-bemat-advanced.bat

# Or check manually
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Kill process if needed (replace PID)
taskkill /PID <PID_NUMBER> /F
```

### Καθαρισμός Docker

```cmd
# From docker-manager.bat → option 5
docker-manager.bat

# Or manually
docker system prune -a -f
docker volume prune -f
```

### Frontend δεν φορτώνει

```bash
cd frontend
docker-compose -f docker-compose.frontend.yml logs frontend
```

### Backend API δεν απαντά

```bash
cd backend
docker-compose logs web
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

# Or use development script for real-time logs
start-development.bat
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
├── backend/           # Django REST API
│   ├── app/          # Django εφαρμογή
│   │   ├── backend/  # Core settings
│   │   ├── building/ # Building models
│   │   ├── user/     # User management
│   │   └── ...       # Other Django apps
│   └── docker-compose.yml
├── frontend/         # React + Vite + TailwindCSS
│   ├── src/         # React components
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── docker-compose.frontend.yml
└── *.bat            # Automation scripts
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

1. **Πάντα χρησιμοποιείτε `stop-all.bat` πριν κλείσετε τον υπολογιστή**
2. **Τρέξτε καθαρισμό Docker μία φορά την εβδομάδα** (`docker-manager.bat` → option 5)
3. **Αν έχετε προβλήματα, σταματήστε όλα και ξεκινήστε ξανά**
4. **Κρατήστε το Docker Desktop ενημερωμένο**
5. **Χρησιμοποιείτε `start-bemat-advanced.bat` για troubleshooting**

## 🔗 Χρήσιμοι σύνδεσμοι

1. [Dockerizing Django with Postgres, Gunicorn and Nginx](https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/#gunicorn)
2. [PostgreSQL with Django](https://www.enterprisedb.com/postgres-tutorials/how-use-postgresql-django)
3. [Django + React Full Stack](https://www.digitalocean.com/community/tutorials/build-a-to-do-application-using-django-and-react)
4. [React 18 + TailwindCSS 3 + Vite 5](https://vitejs.dev/guide/)
5. [Material-UI Documentation](https://mui.com/material-ui/getting-started/)

---

## 🎉 Έτοιμο για χρήση!

**Για άμεση εκκίνηση:** Απλά τρέξτε `start-bemat.bat` και θα ανοίξουν αυτόματα όλα!

**Για προχωρημένη διαχείριση:** `docker-manager.bat` για menu επιλογών.

**Για troubleshooting:** `start-bemat-advanced.bat` με διαγνωστικά.

## 📄 Πληροφορίες

1. [Κλιματικές Ζώνες](https://www.monodomiki.gr/ell/blog-details/klimatikes-zones-kai-oria-syntelesti-thermoperatotitas)

## 📄 Άδεια

Αυτό το project είναι ανοιχτού κώδικα και διαθέσιμο κάτω από την MIT License.
