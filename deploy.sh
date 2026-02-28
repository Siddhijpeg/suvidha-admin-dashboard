#!/bin/bash

# SUVIDHA Admin Dashboard Deployment Script
# Usage: ./deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-staging}
echo "🚀 Starting SUVIDHA Deployment to $ENVIRONMENT..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    
    print_status "All dependencies found ✓"
}

# Backend deployment
deploy_backend() {
    print_status "Deploying Backend..."
    
    cd suvidha-backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm ci --production
    
    # Run tests if available
    if [ -f "package.json" ] && grep -q "test" package.json; then
        print_status "Running backend tests..."
        npm test
    fi
    
    # Deploy based on environment
    if [ "$ENVIRONMENT" = "production" ]; then
        print_status "Deploying to production..."
        railway up --service suvidha-backend
    else
        print_status "Deploying to staging..."
        railway up --service suvidha-backend-staging
    fi
    
    cd ..
}

# Frontend deployment
deploy_frontend() {
    print_status "Deploying Frontend..."
    
    cd suvidha-frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm ci --production
    
    # Run tests if available
    if [ -f "package.json" ] && grep -q "test" package.json; then
        print_status "Running frontend tests..."
        npm test
    fi
    
    # Build for production
    print_status "Building frontend for $ENVIRONMENT..."
    if [ "$ENVIRONMENT" = "production" ]; then
        npm run build:prod
    else
        npm run build
    fi
    
    # Deploy based on environment
    if [ "$ENVIRONMENT" = "production" ]; then
        print_status "Deploying to production..."
        vercel --prod --confirm
    else
        print_status "Deploying to staging..."
        vercel --confirm
    fi
    
    cd ..
}

# Database seeding
seed_database() {
    if [ "$ENVIRONMENT" = "production" ]; then
        print_warning "Skipping database seeding in production"
        print_warning "Seed manually if needed: cd suvidha-backend && node seed-comprehensive-data.js"
        return
    fi
    
    print_status "Seeding database..."
    cd suvidha-backend
    node seed-comprehensive-data.js
    cd ..
}

# Health checks
health_check() {
    print_status "Running health checks..."
    
    # Check backend health
    if [ "$ENVIRONMENT" = "production" ]; then
        BACKEND_URL="https://suvidha-api.railway.app/health"
        FRONTEND_URL="https://suvidha-admin.vercel.app"
    else
        BACKEND_URL="https://suvidha-api-staging.railway.app/health"
        FRONTEND_URL="https://suvidha-admin-staging.vercel.app"
    fi
    
    print_status "Checking backend health..."
    if curl -f -s "$BACKEND_URL" > /dev/null; then
        print_status "Backend health check passed ✓"
    else
        print_error "Backend health check failed ✗"
    fi
    
    print_status "Checking frontend deployment..."
    if curl -f -s "$FRONTEND_URL" > /dev/null; then
        print_status "Frontend health check passed ✓"
    else
        print_error "Frontend health check failed ✗"
    fi
}

# Main deployment flow
main() {
    print_status "Starting deployment to $ENVIRONMENT environment..."
    
    # Check if we're on main branch for production
    if [ "$ENVIRONMENT" = "production" ]; then
        CURRENT_BRANCH=$(git branch --show-current)
        if [ "$CURRENT_BRANCH" != "main" ]; then
            print_error "Must be on main branch for production deployment"
            print_error "Current branch: $CURRENT_BRANCH"
            exit 1
        fi
    fi
    
    # Run checks
    check_dependencies
    
    # Deploy components
    deploy_backend
    deploy_frontend
    seed_database
    
    # Health checks
    sleep 10  # Wait for deployments to propagate
    health_check
    
    # Print deployment URLs
    echo ""
    print_status "🎉 Deployment Complete!"
    echo ""
    echo -e "${GREEN}🌐 Frontend URL:${NC} $FRONTEND_URL"
    echo -e "${GREEN}🔧 Backend API:${NC} $BACKEND_URL"
    echo ""
    echo -e "${GREEN}📊 Analytics:${NC} $FRONTEND_URL/analytics"
    echo -e "${GREEN}🔐 Login:${NC} $FRONTEND_URL/login"
    echo ""
    print_status "Next steps:"
    echo "1. Update environment variables if needed"
    echo "2. Configure custom domain"
    echo "3. Set up monitoring"
    echo "4. Enable SSL certificates"
}

# Run main function
main "$@"
