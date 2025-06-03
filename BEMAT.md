# Building-Energy-Management-Tool-BEMAT
Λογισμικό Υποστήριξης Ενεργειακής Διαχείρισης Κτιρίων

## Περιεχόμενα
1. [Χρήσιμα Sites](#χρήσιμα-sites)
2. [Οδηγίες Εκτέλεσης Backend](#οδηγίες-εκτέλεσης-backend)
3. [Οδηγίες Εκτέλεσης Backend (Production)](#οδηγίες-εκτέλεσης-backend-production)
4. [Git Bash Χρήση](#git-bash-χρήση)
5. [Δημιουργία Admin User](#δημιουργία-admin-user)
6. [Δημιουργία Νέου Πίνακα](#δημιουργία-νέου-πίνακα)
7. [Εγκατάσταση](#εγκατάσταση)
8. [Τερματισμός Container](#τερματισμός-container)
9. [Σύνδεση στη Βάση Δεδομένων](#σύνδεση-στη-βάση-δεδομένων)
10. [Άντληση Δεδομένων](#άντληση-δεδομένων)

---

## Χρήσιμα Sites
1. https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/#gunicorn
2. https://www.enterprisedb.com/postgres-tutorials/how-use-postgresql-django
3. https://www.digitalocean.com/community/tutorials/build-a-to-do-application-using-django-and-react
4. https://nabendu82.medium.com/full-stack-app-with-reactjs-django-0cb33b9835b2
5. https://medium.com/@osamajavaid/setting-up-react-19-with-tailwind-css-v4-using-vite-in-just-two-steps-3748f55b06fd

---

## Οδηγίες Εκτέλεσης Backend
- (http://localhost:8000/admin)
1. `docker-compose down -v`
2. `docker-compose up -d --build`
3. `docker-compose exec web python manage.py migrate --noinput`

---

## Οδηγίες Εκτέλεσης Backend (Production)
- (http://localhost:1337/admin)
1. `docker-compose down -v`
2. `docker-compose -f docker-compose.prod.yml up -d --build`
3. `docker-compose -f docker-compose.prod.yml exec web python manage.py migrate --noinput`
4. `docker-compose -f docker-compose.prod.yml exec web python manage.py collectstatic --no-input --clear`

---

## Git Bash Χρήση
1. `docker ps` (για τα django-container-id)
2. `docker exec -it django-container-id bash`
3. ...

---

## Δημιουργία Admin User
1. `python manage.py createsuperuser`

---

## Δημιουργία Νέου Πίνακα
1. `docker exec -it django-container-id bash` (web)
2. `python manage.py startapp table(users)`
3. Στο `models.py` του table(users) δημιουργήστε το model
4. Προσθέστε στο `admin.py`
5. Προσθέστε το table(users) στο `INSTALLED_APPS` του `settings.py`
6. `python manage.py makemigrations users`
7. `python manage.py migrate`

---

## Εγκατάσταση
1. Git Bash
2. `cd folder/app(folder/backend)`
3. pip ...

---

## Τερματισμός Container
1. `docker stop django-container-id`

---

## Σύνδεση στη Βάση Δεδομένων
1. `docker-compose exec db psql --username=backend --dbname=backend_dev`

---

## Άντληση Δεδομένων
- [Κλιματικές Ζώνες](https://www.monodomiki.gr/ell/blog-details/klimatikes-zones-kai-oria-syntelesti-thermoperatotitas)
