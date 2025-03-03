# Building-Energy-Management-Tool-BEMAT
Λογισμικό Υποστήριξης Ενεργειακής Διαχείρισης Κτιρίων

# useful sites: 
1. https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/#gunicorn
2. https://www.enterprisedb.com/postgres-tutorials/how-use-postgresql-django
3. https://www.digitalocean.com/community/tutorials/build-a-to-do-application-using-django-and-react
4. https://nabendu82.medium.com/full-stack-app-with-reactjs-django-0cb33b9835b2
5. https://medium.com/@osamajavaid/setting-up-react-19-with-tailwind-css-v4-using-vite-in-just-two-steps-3748f55b06fd


# run backend dev (http://localhost:8000/admin)
1. docker-compose down -v
2. docker-compose up -d --build
3. docker-compose exec web python manage.py migrate --noinput

# run backend prod (http://localhost:1337/admin)
1. docker-compose down -v
2. docker-compose -f docker-compose.prod.yml up -d --build
3. docker-compose -f docker-compose.prod.yml exec web python manage.py migrate --noinput
4. docker-compose -f docker-compose.prod.yml exec web python manage.py collectstatic --no-input --clear

# Git Bash
1. docker ps (για τα django-container-id)
2. docker exec -it <django-container-id> bash
3. 

#create admin user
1. python manage.py createsuperuser

#create new table
1. docker exec -it <django-container-id> bash (web)
2. python manage.py startapp table(users)
3. to models.py of table(users) create the model
4. add to admin.py
5. add table(users) to INSTALLED_APPS of settings.py 
6. python manage.py makemigrations users
7. python manage.py migrate

#installation
1. git bash
2. cd folder/app(folder/backend)
3. pip ...

#stop container
1.docker stop <django-container-id>

