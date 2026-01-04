#!/bin/bash

# Production entrypoint script for Django with Gunicorn

# Exit on any error
set -e

echo "========================================="
echo "BEMAT Backend - Production Mode"
echo "========================================="

echo "Waiting for PostgreSQL..."
until nc -z $SQL_HOST $SQL_PORT; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo "✅ PostgreSQL started"

# Wait a bit more to ensure PostgreSQL is fully ready
sleep 2

echo "Running database migrations..."
python manage.py migrate --noinput
echo "✅ Migrations completed"

echo "Loading initial prefectures data..."
python manage.py populate_prefectures || echo "⚠️  Prefectures already loaded or command not found"

echo "Loading initial materials data..."
python manage.py load_materials --update --clean || echo "⚠️  Materials loading failed or command not found"

echo "Loading initial numeric values..."
python manage.py create_numeric_values || echo "⚠️  Numeric values already loaded or command not found"

echo "Collecting static files..."
python manage.py collectstatic --noinput
echo "✅ Static files collected"

echo "========================================="
echo "Starting Gunicorn server..."
echo "Workers: ${GUNICORN_WORKERS:-4}"
echo "Threads: ${GUNICORN_THREADS:-2}"
echo "Timeout: ${GUNICORN_TIMEOUT:-120}s"
echo "========================================="

# Start Gunicorn
# Use environment variables for configuration with sensible defaults
exec gunicorn backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers ${GUNICORN_WORKERS:-4} \
    --threads ${GUNICORN_THREADS:-2} \
    --timeout ${GUNICORN_TIMEOUT:-120} \
    --access-logfile - \
    --error-logfile - \
    --log-level ${GUNICORN_LOG_LEVEL:-info} \
    --capture-output \
    --enable-stdio-inheritance
