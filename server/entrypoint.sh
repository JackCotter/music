#!/bin/bash

# Wait for PostgreSQL to be available
echo "Waiting for PostgreSQL to be available..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL is available!"

# Run database migrations (this can be expanded later to use Flask-Migrate)
echo "Running database migrations (if any)..."
flask db upgrade  # This assumes you have Flask-Migrate configured

# Start Flask development server
echo "Starting Flask app..."
flask run --host=0.0.0.0 --port=5000
