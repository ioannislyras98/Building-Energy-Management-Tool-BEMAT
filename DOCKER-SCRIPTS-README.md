# BEMAT Docker Management Scripts 🐋

Αυτά τα batch scripts σας επιτρέπουν να διαχειρίζεστε εύκολα τα Docker containers του BEMAT project με **αυτόματο άνοιγμα browsers** και **npm install** για το frontend.

## 🚀 Γρήγορη Εκκίνηση

### **Βήμα 1**: Κλωνοποίηση

```bash
git clone https://github.com/your-username/Building-Energy-Management-Tool-BEMAT.git
cd Building-Energy-Management-Tool-BEMAT
```

### **Βήμα 2**: Εκτέλεση

```cmd
start-bemat.bat
```

**Αυτό είναι όλο!** Το script θα:

- ✅ Χτίσει όλα τα Docker containers
- ✅ Κάνει npm install για το frontend
- ✅ Εκτελέσει τις Django migrations
- ✅ Ανοίξει αυτόματα τα browsers στο Frontend & Backend

## 📋 Διαθέσιμα Scripts

### 🚀 Γρήγορη Εκτέλεση

- **`start-bemat.bat`** - Εκτελεί όλα τα containers σε background mode (μπορείς να κλείσεις το terminal) 🔄
- **`start-bemat-advanced.bat`** - Προηγμένη εκκίνηση με έλεγχους και διαγνωστικά

### 📋 Διαχείριση με Menu

- **`docker-manager.bat`** - Κεντρικό menu για όλες τις λειτουργίες

### 🛠️ Ειδικά Scripts

- **`start-development.bat`** - Εκτέλεση Development environment (με terminal windows)
- **`rebuild-containers.bat`** - Ανακατασκευή containers με τελευταίες dependencies
- **`stop-all.bat`** - Σταματά όλα τα containers

## 🔧 Χρήση

### Γρήγορη Εκτέλεση (Απλούστερη)

```cmd
start-bemat.bat
```

**Τώρα τρέχει σε background mode! Πλεονεκτήματα:**

- ✅ Μπορείς να κλείσεις το cmd window
- ✅ Containers συνεχίζουν να τρέχουν
- ✅ Δεν δεσμεύεται το terminal
- ✅ Ιδανικό για καθημερινή χρήση

### Με Menu (Περισσότερες επιλογές)

```cmd
docker-manager.bat
```

Επιλογές menu:

1. Start Development Environment (Background Mode)
2. Stop All Services
3. **Rebuild Containers (Force Update Dependencies)**
4. View Docker Status
5. Clean Docker System
6. Exit

### Ανακατασκευή Containers (Νέο!)

```cmd
rebuild-containers.bat
```

Χρησιμοποιήστε αυτό όταν:

- Προσθέσατε νέες dependencies
- Αντιμετωπίζετε προβλήματα με packages
- Θέλετε καθαρή εγκατάσταση

### Σταμάτημα όλων

```cmd
stop-all.bat
```

## ⚙️ Τι κάνει κάθε script

### start-bemat.bat

- 🔨 Χτίζει το backend (Django API + PostgreSQL)
- 🔨 Χτίζει το frontend (React/Vite) **με npm install**
- 🖥️ Ανοίγει 2 terminal windows
- 🌐 **Αυτόματα ανοίγει τα browsers** στο Frontend & Backend
- ⏱️ Περιμένει 30 δευτερόλεπτα για τα services να είναι έτοιμα
- 📱 Προσβάσιμο στο: http://localhost:3000

### docker-manager.bat

- 📋 Menu με όλες τις επιλογές
- 📊 Status check containers
- 🧹 Καθαρισμός Docker system
- ⏹️ Stop όλων των services
- 🌐 **Αυτόματο άνοιγμα browsers** για development mode

### start-development.bat

- 🔨 Development environment με hot reload
- 🌐 Ανοίγει: Frontend + Backend API
- ⏱️ Περιμένει 30 δευτερόλεπτα

## 🌐 Services που εκτελούνται

- **Frontend**: http://localhost:3000 🎨
- **Backend API**: http://localhost:8000 ⚙️
- **Admin Panel**: http://localhost:8000/admin 👤
- **Database**: PostgreSQL (port 5432) 🗄️

## 📋 Προαπαιτούμενα

- ✅ **Docker Desktop** εγκατεστημένο και τρέχον
- ✅ **Windows** (τα batch scripts είναι για Windows)
- ✅ **Git** (για κλωνοποίηση του repository)
- ✅ Ports **3000, 8000, 5432** διαθέσιμα

### Έλεγχος Προαπαιτούμενων

```powershell
# Έλεγχος Docker
docker --version

# Έλεγχος διαθέσιμων ports
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

## 🔧 Αντιμετώπιση Προβλημάτων

### ❌ Κάποιο container δεν εκτελείται

1. Τρέξτε `stop-all.bat`
2. Ελέγξτε ότι το Docker Desktop τρέχει
3. Τρέξτε ξανά το επιθυμητό script

### ❌ Ports σε χρήση

```powershell
# Βρες ποια διεργασία χρησιμοποιεί το port
netstat -ano | findstr :3000

# Σκότωσε τη διεργασία (αντικατέστησε PID)
taskkill /PID <PID_NUMBER> /F
```

### ❌ Frontend δεν φορτώνει

```bash
cd frontend
docker-compose -f docker-compose.frontend.yml logs frontend
```

### ❌ Backend API δεν απαντά

```bash
cd backend
docker-compose logs web
```

### 🧹 Γενικός καθαρισμός Docker

```cmd
docker-manager.bat → επιλογή 5
```

**Ή χειροκίνητα:**

```bash
docker system prune -a -f
docker volume prune -f
```

## 🎯 Χρήσιμες Εντολές

### Έλεγχος κατάστασης containers

```bash
docker ps -a
```

### Παρακολούθηση logs

```bash
# Backend
docker-compose -f backend/docker-compose.yml logs -f web

# Frontend
docker-compose -f frontend/docker-compose.frontend.yml logs -f frontend
```

### Μπες σε container

```bash
# Backend
docker exec -it backend-web-1 bash

# Frontend
docker exec -it frontend-frontend-1 sh
```

## 🏆 Best Practices

1. **Πάντα χρησιμοποιείτε `stop-all.bat` πριν κλείσετε τον υπολογιστή**
2. **Τρέξτε καθαρισμό Docker μία φορά την εβδομάδα** (docker-manager.bat → 5)
3. **Αν έχετε προβλήματα, σταματήστε όλα και ξεκινήστε ξανά**
4. **Κρατήστε το Docker Desktop ενημερωμένο**

---

## 🎉 Έτοιμο για χρήση!

**Για άμεση εκκίνηση:** `start-bemat.bat` και όλα θα ανοίξουν αυτόματα!

**Για προχωρημένη διαχείριση:** `docker-manager.bat` για menu επιλογών.
