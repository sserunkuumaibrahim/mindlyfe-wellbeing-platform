#!/bin/bash

# Mindlyfe Docker Setup Script
echo "🚀 Mindlyfe - Mental Health Platform"
echo "===================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available."
    echo "Please install Docker Desktop which includes Docker Compose"
    exit 1
fi

echo "✅ Docker is installed and running"
echo ""

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running."
    echo "Please start Docker Desktop"
    exit 1
fi

echo "🐳 Starting Mindlyfe application stack..."
echo ""
echo "This will start:"
echo "  - PostgreSQL database (port 5432)"
echo "  - Backend API server (port 3001)"  
echo "  - Frontend development server (port 5173)"
echo ""

# Start the application
if command -v docker-compose &> /dev/null; then
    docker-compose up --build
else
    docker compose up --build
fi
