# Use an official Python runtime as a parent image
FROM python:3.8

# Set environment variables
# ENV PYTHONUNBUFFERED 1
# ENV DJANGO_SETTINGS_MODULE myproject.settings

# Create and set the working directory
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt /app/

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project directory into the container
COPY . /app/

# Expose the port your application runs on
EXPOSE 8000

# Define environment variable for Django
# ENV DJANGO_SETTINGS_MODULE=myproject.settings

# Start your application
CMD ["sh", "startup.sh"]
