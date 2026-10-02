FROM python:3.11-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy ML assets and backend code
COPY ml/ /app/ml/
COPY backend/ /app/backend/

WORKDIR /app/backend

# Expose Django port
EXPOSE 8000

# Run migrations, seed, and start gunicorn
CMD ["sh", "-c", "python manage.py migrate && python seed_advanced_data.py && gunicorn landsafener_backend.wsgi:application --bind 0.0.0.0:8000 --workers 3"]
