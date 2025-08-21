#!/bin/bash

echo "🌱 Welcome to AgriLink Lanka Setup!"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) is installed"
echo ""

# Backend setup
echo "🚀 Setting up Backend..."
echo "------------------------"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please update it with your configuration."
    echo "   Important: Update MONGODB_URI, JWT_SECRET, and other required values."
else
    echo "✅ .env file already exists"
fi

echo ""

# Frontend setup
echo "🎨 Setting up Frontend..."
echo "-------------------------"

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "❌ Frontend directory not found. Please ensure the project structure is correct."
    exit 1
fi

# Navigate to frontend directory
cd frontend

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Go back to root directory
cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo "================================"
echo ""
echo "📋 Next steps:"
echo "1. Update the .env file with your configuration:"
echo "   - MongoDB connection string"
echo "   - JWT secret key"
echo "   - Stripe API keys"
echo "   - Email configuration"
echo ""
echo "2. Start the backend server:"
echo "   npm run dev"
echo ""
echo "3. In a new terminal, start the frontend:"
echo "   cd frontend && npm start"
echo ""
echo "4. Open your browser to http://localhost:3000"
echo ""
echo "📚 For detailed setup instructions, see README.md"
echo ""
echo "🌱 Happy farming with AgriLink Lanka!"
