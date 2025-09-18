#!/bin/bash

# Jersey Republic - Development Setup Script
# This script sets up the development environment for the unified project

set -e

echo "🚀 Setting up Jersey Republic Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "npm $(npm -v) is installed"
}

# Install root dependencies
install_root_deps() {
    print_status "Installing root dependencies..."
    npm install
    print_success "Root dependencies installed"
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    print_success "Frontend dependencies installed"
}

# Install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
}

# Setup environment files
setup_env_files() {
    print_status "Setting up environment files..."
    
    # Frontend .env
    if [ ! -f "frontend/.env" ]; then
        cp frontend/.env.example frontend/.env
        print_success "Frontend .env file created"
    else
        print_warning "Frontend .env file already exists"
    fi
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        print_success "Backend .env file created"
    else
        print_warning "Backend .env file already exists"
    fi
}

# Check MongoDB connection
check_mongodb() {
    print_status "Checking MongoDB connection..."
    
    if command -v mongod &> /dev/null; then
        print_success "MongoDB is installed locally"
    else
        print_warning "MongoDB is not installed locally. You may need to:"
        echo "  1. Install MongoDB locally, or"
        echo "  2. Use MongoDB Atlas (cloud), or"
        echo "  3. Use Docker to run MongoDB"
        echo ""
        echo "For Docker: docker run -d -p 27017:27017 --name mongodb mongo:6.0"
    fi
}

# Build projects
build_projects() {
    print_status "Building projects..."
    
    # Build backend
    cd backend
    npm run build
    cd ..
    print_success "Backend built successfully"
    
    # Build frontend
    cd frontend
    npm run build
    cd ..
    print_success "Frontend built successfully"
}

# Main setup function
main() {
    echo "=========================================="
    echo "Jersey Republic Development Setup"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    check_node
    check_npm
    echo ""
    
    # Install dependencies
    install_root_deps
    install_frontend_deps
    install_backend_deps
    echo ""
    
    # Setup environment
    setup_env_files
    echo ""
    
    # Check MongoDB
    check_mongodb
    echo ""
    
    # Build projects
    build_projects
    echo ""
    
    # Final instructions
    echo "=========================================="
    print_success "Setup completed successfully!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Update environment files if needed:"
    echo "   - frontend/.env"
    echo "   - backend/.env"
    echo ""
    echo "2. Start MongoDB (if not using Docker):"
    echo "   mongod"
    echo ""
    echo "3. Start development servers:"
    echo "   npm run dev"
    echo ""
    echo "4. Access the application:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:3003"
    echo "   - Admin Panel: http://localhost:3003/admin"
    echo ""
    echo "Happy coding! 🎉"
}

# Run main function
main