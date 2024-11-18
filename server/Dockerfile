# Base image with Python and required libraries
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements.txt to the container
COPY requirements.txt /app/

# Install dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code to the container
COPY . /app/

# Copy the SQL schema file to the container
COPY schema.sql /docker-entrypoint-initdb.d/

# Make the entrypoint script executable
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose Flask's default port
EXPOSE 5000

# Set the default command to start Flask with hot reload (development mode)
CMD ["./entrypoint.sh"]
