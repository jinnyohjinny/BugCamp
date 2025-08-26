#!/bin/bash

echo "🚀 Starting BugCamp Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "⚠️  Docker is not running. Some features may not work properly."
fi

# Install API server dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing API server dependencies..."
    npm install --prefix . express cors
fi

# Start API server in background
echo "🔧 Starting API server on port 3001..."
node api-server.js &
API_PID=$!

# Wait a moment for API server to start
sleep 2

# Check if API server is running
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ API server is running on http://localhost:3001"
else
    echo "❌ Failed to start API server"
    kill $API_PID 2>/dev/null
    exit 1
fi

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Start frontend in background
echo "🌐 Starting frontend on port 5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 BugCamp is starting up!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 API Server: http://localhost:3001"
echo "🐳 Attacker Server: http://localhost:6969 (when labs are deployed)"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping BugCamp services..."
    kill $API_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
