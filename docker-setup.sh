#!/bin/bash

# Mindlyfe Docker Setup Script
# This script helps set up and manage the Mindlyfe application using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_color $RED "❌ Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose > /dev/null 2>&1; then
        print_color $RED "❌ Docker Compose not found. Please install Docker Desktop or Docker Compose."
        exit 1
    fi
}

# Function to start the application
start_app() {
    print_color $BLUE "🚀 Starting Mindlyfe application..."
    print_color $YELLOW "This may take a few minutes on first run (downloading images and building containers)..."
    docker-compose up --build
}

# Function to start the application in background
start_app_detached() {
    print_color $BLUE "🚀 Starting Mindlyfe application in background..."
    docker-compose up --build -d
    print_color $GREEN "✅ Application started in background!"
    print_color $BLUE "Frontend: http://localhost:5173"
    print_color $BLUE "Backend API: http://localhost:3001"
    print_color $YELLOW "Use 'npm run docker:logs' to view logs"
}

# Function to stop the application
stop_app() {
    print_color $YELLOW "🛑 Stopping Mindlyfe application..."
    docker-compose down
    print_color $GREEN "✅ Application stopped!"
}

# Function to clean up everything
clean_all() {
    print_color $YELLOW "🧹 Cleaning up all containers, volumes, and images..."
    docker-compose down -v --remove-orphans
    print_color $GREEN "✅ Cleanup complete!"
}

# Function to show logs
show_logs() {
    print_color $BLUE "📋 Showing application logs (Ctrl+C to exit)..."
    docker-compose logs -f
}

# Function to show status
show_status() {
    print_color $BLUE "📊 Container Status:"
    docker-compose ps
}

# Function to access database
access_db() {
    print_color $BLUE "🗄️  Accessing PostgreSQL database..."
    docker-compose exec postgres psql -U postgres -d mindlyfe
}

# Function to show help
show_help() {
    echo "Mindlyfe Docker Setup Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start     Start the application (foreground)"
    echo "  start-bg  Start the application (background)"
    echo "  stop      Stop the application"
    echo "  restart   Restart the application"
    echo "  logs      Show application logs"
    echo "  status    Show container status"
    echo "  clean     Clean up containers and volumes"
    echo "  db        Access PostgreSQL database"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start     # Start in foreground"
    echo "  $0 start-bg # Start in background"
    echo "  $0 logs     # View logs"
    echo "  $0 clean    # Clean everything"
}

# Main script logic
main() {
    print_color $GREEN "🏥 Mindlyfe Mental Health Platform - Docker Setup"
    print_color $BLUE "================================================"
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Handle commands
    case "${1:-start}" in
        "start")
            start_app
            ;;
        "start-bg"|"background")
            start_app_detached
            ;;
        "stop")
            stop_app
            ;;
        "restart")
            stop_app
            start_app
            ;;
        "logs")
            show_logs
            ;;
        "status")
            show_status
            ;;
        "clean")
            clean_all
            ;;
        "db"|"database")
            access_db
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_color $RED "❌ Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
