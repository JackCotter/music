# Use the official Python image as base
FROM python:latest

# Set the working directory
WORKDIR /usr/src/app

# Copy requirements file and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the port Flask runs on (usually 5000)
EXPOSE 5000

# Command to start the Flask server
CMD ["python", "app.py"]
