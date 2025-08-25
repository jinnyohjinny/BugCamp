FROM python:3.9-alpine

# Install necessary packages
RUN apk add --no-cache \
    gcc \
    musl-dev \
    python3-dev

# Create app directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/logs

# Expose port 5000
EXPOSE 5000

# Start the application
CMD ["python", "app.py"]
