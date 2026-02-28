#!/bin/bash

# SUVIDHA Admin Dashboard - Vercel + Render Deployment Script
# Usage: ./deploy-vercel-render.sh [production|staging]

set -e

ENVIRONMENT=${1:-staging}
echo "🚀 Deploying SUVIDHA to $ENVIRONMENT..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check dependencies
check_dependencies() {
    print_step "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Install from https://nodejs.org"
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
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed. Run: npm i -g vercel"
        exit 1
    fi
    
    print_status "All dependencies found ✓"
}

# Deploy to Render (Backend)
deploy_backend_render() {
    print_step "Deploying Backend to Render..."
    
    cd suvidha-backend
    
    # Check if render.yaml exists
    if [ ! -f "render.yaml" ]; then
        print_error "render.yaml not found in suvidha-backend directory"
        exit 1
    fi
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm ci --production
    
    # Check if we're on correct branch
    if [ "$ENVIRONMENT" = "production" ]; then
        CURRENT_BRANCH=$(git branch --show-current)
        if [ "$CURRENT_BRANCH" != "main" ]; then
            print_error "Must be on main branch for production deployment"
            print_error "Current branch: $CURRENT_BRANCH"
            exit 1
        fi
    fi
    
    # Deploy to Render
    print_status "Deploying to Render..."
    if command -v render &> /dev/null; then
        render deploy
    else
        print_warning "Render CLI not found. Manual deployment required:"
        print_warning "1. Go to https://dashboard.render.com"
        print_warning "2. Connect your Git repository"
        print_warning "3. Use render.yaml configuration"
    fi
    
    cd ..
}

# Deploy to Vercel (Frontend)
deploy_frontend_vercel() {
    print_step "Deploying Frontend to Vercel..."
    
    cd suvidha-frontend
    
    # Check if vercel.json exists
    if [ ! -f "vercel.json" ]; then
        print_error "vercel.json not found in suvidha-frontend directory"
        exit 1
    fi
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm ci --production
    
    # Build for production
    print_status "Building frontend..."
    if [ "$ENVIRONMENT" = "production" ]; then
        npm run build
    else
        npm run build
    fi
    
    # Deploy to Vercel
    print_status "Deploying to Vercel..."
    vercel --prod --confirm
    
    cd ..
}

# Update environment configurations
update_configs() {
    print_step "Updating configurations..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Update vercel.json with production URLs
        sed -i 's|suvidha-backend.onrender.com|your-backend-url.onrender.com|g' suvidha-frontend/vercel.json
        
        print_status "Updated vercel.json for production"
        print_warning "Remember to update:"
        print_warning "1. SUPABASE_URL in render.yaml"
        print_warning "2. SUPABASE_SERVICE_ROLE_KEY in render.yaml"
        print_warning "3. RAZORPAY keys in render.yaml"
    else
        print_status "Using staging configurations"
    fi
}

# Health checks
health_checks() {
    print_step "Running health checks..."
    
    # Wait for deployments to propagate
    print_status "Waiting for deployments to propagate..."
    sleep 30
    
    if [ "$ENVIRONMENT" = "production" ]; then
        BACKEND_URL="https://suvidha-backend.onrender.com/health"
        FRONTEND_URL="https://suvidha-admin.vercel.app"
    else
        BACKEND_URL="https://suvidha-backend-staging.onrender.com/health"
        FRONTEND_URL="https://suvidha-admin-staging.vercel.app"
    fi
    
    # Check backend health
    print_status "Checking backend health..."
    if curl -f -s "$BACKEND_URL" > /dev/null; then
        print_status "Backend health check passed ✓"
    else
        print_error "Backend health check failed ✗"
    fi
    
    # Check frontend deployment
    print_status "Checking frontend deployment..."
    if curl -f -s "$FRONTEND_URL" > /dev/null; then
        print_status "Frontend health check passed ✓"
    else
        print_error "Frontend health check failed ✗"
    fi
}

# Main deployment function
main() {
    print_status "Starting SUVIDHA deployment to $ENVIRONMENT..."
    print_status "Backend: Render | Frontend: Vercel"
    
    # Run deployment steps
    check_dependencies
    update_configs
    deploy_backend_render
    deploy_frontend_vercel
    health_checks
    
    # Print deployment URLs
    echo ""
    echo -e "${GREEN}🎉 Deployment Complete!${NC}"
    echo ""
    echo -e "${BLUE}🌐 Frontend URL:${NC} $FRONTEND_URL"
    echo -e "${BLUE}🔧 Backend API:${NC} $BACKEND_URL"
    echo ""
    echo -e "${GREEN}📊 Analytics:${NC} $FRONTEND_URL/analytics"
    echo -e "${GREEN}🔐 Login:${NC} $FRONTEND_URL/login"
    echo ""
    echo -e "${GREEN}📱 Demo Users:${NC}"
    echo "  Super Admin: admin@suvidha.gov.in / Admin@123"
    echo "  Dept Admin: electricity.admin@suvidha.gov.in / Admin@123"
    echo "  Operator: operator@suvidha.gov.in / Admin@123"
    echo ""
    echo -e "${YELLOW}⚠️  Important Next Steps:${NC}"
    echo "1. Update environment variables in Render dashboard"
    echo "2. Configure custom domain names"
    echo "3. Set up monitoring and alerts"
    echo "4. Enable SSL certificates"
    echo "5. Update production secrets"
}

# Run main function
main "$@"
