#!/bin/bash

# Exit on any error
set -e

echo "Waiting for PostgreSQL..."
until nc -z db 5432; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo "PostgreSQL started"

# Wait a bit more to ensure PostgreSQL is fully ready
sleep 2

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Loading initial prefectures data..."
python manage.py populate_prefectures

echo "Loading initial materials data..."
python manage.py load_materials

echo "Loading initial numeric values..."
python manage.py create_numeric_values

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000