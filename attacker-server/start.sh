#!/bin/bash

# Web Attacker Server Startup Script
# For educational pentesting labs only

set -e

echo "⚡ Starting Web Attacker Server..."
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads logs

# Set proper permissions
echo "🔐 Setting permissions..."
chmod 755 uploads logs

# Build and start the container
echo "🐳 Building and starting Docker container..."
docker-compose up --build -d

# Wait for the server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Check if the server is running
if curl -f http://localhost:8080/health &> /dev/null; then
    echo "✅ Server is running successfully!"
    echo ""
    echo "🌐 Access the web interface at: http://localhost:8080"
    echo "📊 Health check: http://localhost:8080/health"
    echo "📁 Upload files at: http://localhost:8080/upload"
    echo "📋 View logs at: http://localhost:8080/logs"
    echo ""
    echo "📝 Sample files are available in the sample-files/ directory"
    echo "🔧 To stop the server: docker-compose down"
    echo "📖 For more information, see README.md"
else
    echo "❌ Server failed to start. Check logs with: docker-compose logs"
    exit 1
fi
