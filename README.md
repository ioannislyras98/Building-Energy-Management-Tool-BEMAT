# Building Energy Management Tool (BEMAT) 🏢⚡

Λογισμικό Υποστήριξης Ενεργειακής Διαχείρισης Κτιρίων - Ολοκληρωμένη εφαρμογή με Django Backend & React Frontend

## 🚀 Γρήγορη Εκκίνηση (Recommended)

**Για άμεση εκτέλεση όλης της εφαρμογής:**

1. **Προαπαιτούμενα:**

   - Εγκαταστήστε [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - Εκκινήστε το Docker Desktop και περιμένετε να φορτώσει πλήρως
   - Εγκαταστήστε [Git](https://git-scm.com/downloads) (εαν δεν το έχετε)

2. **Κλωνοποίηση του repository:**

   ```bash
   git clone https://github.com/your-username/Building-Energy-Management-Tool-BEMAT.git
   cd Building-Energy-Management-Tool-BEMAT
   ```

3. **Εκτέλεση με ένα κλικ:**

   ```cmd
   start-bemat.bat
   ```

   ✅ Αυτόματα ξεκινούν όλα τα services  
   ✅ Ανοίγουν τα browsers στο Frontend & Backend  
   ✅ Γίνεται npm install για το frontend  
   ✅ Εκτελούνται οι migrations

   **🔧 Αν αντιμετωπίσετε προβλήματα:**

   ```cmd
   start-bemat-advanced.bat    # Για διαγνωστικά και πλήρεις έλεγχους
   rebuild-containers.bat      # Για προβλήματα dependencies
   ```

## 📋 Διαθέσιμα Scripts

| Script                     | Περιγραφή                               | Browser Auto-Open     |
| -------------------------- | --------------------------------------- | --------------------- |
| `start-bemat.bat`          | Γρήγορη εκκίνηση (Background Mode)      | ✅ Frontend + Backend |
| `start-bemat-advanced.bat` | Προηγμένη εκκίνηση με πλήρεις έλεγχους  | ✅ Frontend + Backend |
| `start-bemat-detached.bat` | Απλή εκκίνηση χωρίς health checking     | ❌                    |
| `rebuild-containers.bat`   | Ανακατασκευή containers + dependencies  | ✅ Frontend + Backend |
| `docker-manager.bat`       | Κεντρικό menu διαχείρισης               | ✅ Background mode    |
| `start-development.bat`    | Development environment (Terminal mode) | ✅ Frontend + Backend |
| `stop-all.bat`             | Σταματά όλα τα containers               | ❌                    |

### 🔧 Επιλογή του κατάλληλου script:

- **Νέος χρήστης**: `start-bemat.bat` (συνιστάται)
- **Προβλήματα με ports/Docker**: `start-bemat-advanced.bat`
- **Γρήγορη εκκίνηση χωρίς περιμονή**: `start-bemat-detached.bat`
- **Προβλήματα με dependencies**: `rebuild-containers.bat`

## 🌐 URLs μετά την εκκίνηση

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **Database**: PostgreSQL (port 5432)

## 🛠️ Προαπαιτούμενα

- **Docker Desktop** εγκατεστημένο και ενεργό
- **Git** (για κλωνοποίηση)
- **Windows** (τα scripts είναι για Windows)
- Διαθέσιμα ports: 3000, 8000, 5432

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

### Τα containers δεν ξεκινούν

1. Τρέξε `stop-all.bat`
2. Έλεγξε ότι το Docker Desktop τρέχει
3. Τρέξε ξανά `start-bemat.bat`

### Πρόβλημα με ports

```bash
# Έλεγξε ποια ports χρησιμοποιούνται
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

### Καθαρισμός Docker

```bash
# Από το docker-manager.bat → επιλογή 5
# Ή χειροκίνητα:
docker system prune -a -f
docker volume prune -f
```

### Frontend δεν φορτώνει

```bash
cd frontend
docker-compose -f docker-compose.frontend.yml logs frontend
```

## 🏗️ Αρχιτεκτονική

```
BEMAT/
├── backend/           # Django REST API
│   ├── app/          # Django εφαρμογή
│   └── docker-compose.yml        # Development
├── frontend/         # React + Vite + TailwindCSS
│   ├── src/         # React components
│   └── docker-compose.frontend.yml
└── *.bat            # Automation scripts
```

## 📦 Tech Stack

**Backend:**

- Django 4.x
- Django REST Framework
- PostgreSQL 15

**Frontend:**

- React 18
- Vite (Build tool)
- TailwindCSS 4.x
- Axios (HTTP client)

**DevOps:**

- Docker & Docker Compose
- Automated batch scripts
- Auto browser opening

## 🔗 Χρήσιμοι σύνδεσμοι

1. [Dockerizing Django with Postgres, Gunicorn and Nginx](https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/#gunicorn)
2. [PostgreSQL with Django](https://www.enterprisedb.com/postgres-tutorials/how-use-postgresql-django)
3. [Django + React Full Stack](https://www.digitalocean.com/community/tutorials/build-a-to-do-application-using-django-and-react)
4. [React 19 + TailwindCSS 4 + Vite](https://medium.com/@osamajavaid/setting-up-react-19-with-tailwind-css-v4-using-vite-in-just-two-steps-3748f55b06fd)

## 📄 Άδεια

---

**Για γρήγορη εκκίνηση:** Απλά τρέξτε `start-bemat.bat` και θα ανοίξουν αυτόματα όλα! 🎉

## 📄 Πληροφορίες

1. [Κλιματικες Ζωνες](https://www.monodomiki.gr/ell/blog-details/klimatikes-zones-kai-oria-syntelesti-thermoperatotitas)
