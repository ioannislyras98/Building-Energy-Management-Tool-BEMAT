# Building-Energy-Management-Tool-BEMAT
Λογισμικό Υποστήριξης Ενεργειακής Διαχείρισης Κτιρίων

# useful sites: 
https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/#gunicorn

# run backend dev (http://localhost:8000/admin)
1. docker-compose down -v
2. docker-compose up -d --build
3. docker-compose exec web python manage.py migrate --noinput

# run backend prod (http://localhost:1337/admin)
1. docker-compose down -v
2. docker-compose -f docker-compose.prod.yml up -d --build
3. docker-compose -f docker-compose.prod.yml exec web python manage.py migrate --noinput
4. docker-compose -f docker-compose.prod.yml exec web python manage.py collectstatic --no-input --clear
