# BEMAT Docker Management Scripts

Αυτά τα batch scripts σας επιτρέπουν να διαχειρίζεστε εύκολα τα Docker containers του BEMAT project.

## Διαθέσιμα Scripts

### 🚀 Γρήγορη Εκτέλεση
- **`start-bemat.bat`** - Εκτελεί όλα τα containers με μία εντολή (Development mode)

### 📋 Διαχείριση με Menu
- **`docker-manager.bat`** - Κεντρικό menu για όλες τις λειτουργίες

### 🛠️ Ειδικά Scripts
- **`start-development.bat`** - Εκτέλεση Development environment
- **`start-production.bat`** - Εκτέλεση Production environment  
- **`stop-all.bat`** - Σταματά όλα τα containers

## Χρήση

### Γρήγορη Εκτέλεση (Απλούστερη)
```cmd
start-bemat.bat
```

### Με Menu (Περισσότερες επιλογές)
```cmd
docker-manager.bat
```

## Τι κάνει κάθε script

### start-bemat.bat
- Εκτελεί το backend (Django API + PostgreSQL)
- Εκτελεί το frontend (React/Vite)
- Ανοίγει 2 terminal windows
- Προσβάσιμο στο: http://localhost:3000

### docker-manager.bat
- Menu με όλες τις επιλογές
- Development ή Production mode
- Status check containers
- Καθαρισμός Docker system
- Stop όλων των services

### Services που εκτελούνται

#### Development Mode:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000  
- **Database**: PostgreSQL (port 5432)

#### Production Mode:
- **Application**: http://localhost:1337 (via Nginx)
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000 (via Nginx)
- **Database**: PostgreSQL (port 5432)

## Προαπαιτούμενα

- Docker Desktop εγκατεστημένο και τρέχον
- Git Bash ή Windows Command Prompt
- Ports 3000, 8000, 5432 (και 1337 για production) διαθέσιμα

## Αντιμετώπιση Προβλημάτων

Εάν κάποιο container δεν εκτελείται:
1. Τρέξτε `stop-all.bat`
2. Ελέγξτε ότι το Docker Desktop τρέχει
3. Τρέξτε ξανά το επιθυμητό script

Για καθαρισμό Docker system:
```cmd
docker-manager.bat → επιλογή 5
```
