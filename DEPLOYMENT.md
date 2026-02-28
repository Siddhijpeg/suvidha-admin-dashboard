# SUVIDHA Admin Dashboard Deployment Guide

## 🚀 Production Deployment

### **Prerequisites**
- Node.js 18+ 
- Supabase account with project setup
- Domain name (optional)
- SSL certificate (recommended)

---

## 📋 Deployment Checklist

### **1. Environment Setup**

#### **Backend Environment Variables**
```bash
# Production .env
NODE_ENV=production
PORT=5000

# Supabase (from your Supabase project)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Frontend URL
CLIENT_URL=https://yourdomain.com

# Razorpay (for payments)
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_secret_key
```

#### **Frontend Environment Variables**
```bash
# .env.production
VITE_API_URL=https://api.yourdomain.com/api
VITE_ENVIRONMENT=production
```

### **2. Database Setup**

#### **Run Production Seed**
```bash
cd suvidha-backend
node seed-comprehensive-data.js
```

#### **Verify Data**
- Check Supabase dashboard for seeded data
- Verify all tables are populated
- Test authentication with demo users

### **3. Backend Deployment**

#### **Option A: Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy backend
cd suvidha-backend
railway up
```

#### **Option B: Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy backend
cd suvidha-backend
vercel --prod
```

#### **Option C: DigitalOcean**
```bash
# Create Droplet with Ubuntu 22.04
# SSH into server
git clone https://github.com/your-repo.git
cd suvidha-admin-dashboard
cd suvidha-backend

# Install dependencies
npm install

# Setup PM2
npm install -g pm2
pm2 start server.js --name "suvidha-backend"

# Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/suvidha-api
```

### **4. Frontend Deployment**

#### **Option A: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd suvidha-frontend
vercel --prod
```

#### **Option B: Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy frontend
cd suvidha-frontend
npm run build
netlify deploy --prod --dir=dist
```

#### **Option C: AWS S3 + CloudFront**
```bash
# Build frontend
cd suvidha-frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

---

## 🔧 Production Configuration

### **Backend Production Settings**

#### **server.js Updates**
```javascript
// Add production middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const rateLimit = require('express-rate-limit');
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
}));
```

#### **Frontend Production Build**
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['lucide-react']
        }
      }
    }
  },
  server: {
    host: true,
    port: 3000
  }
});
```

---

## 🔒 Security Checklist

### **Authentication**
- [ ] Change default admin passwords
- [ ] Enable 2FA for Supabase
- [ ] Set up proper JWT secrets
- [ ] Implement session timeout

### **API Security**
- [ ] Enable CORS for production domain only
- [ ] Add API rate limiting
- [ ] Implement request logging
- [ ] Set up SSL certificates

### **Database Security**
- [ ] Enable Row Level Security (RLS)
- [ ] Regular backups configured
- [ ] Audit logging enabled
- [ ] Connection pooling configured

---

## 📊 Monitoring Setup

### **Backend Monitoring**
```bash
# PM2 Monitoring
pm2 monit

# Log management
pm2 logs suvidha-backend

# Health check endpoint
curl https://api.yourdomain.com/health
```

### **Frontend Monitoring**
```javascript
// Add to main.jsx
if (import.meta.env.PROD) {
  // Google Analytics
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
  document.head.appendChild(script);
}
```

---

## 🚀 Deployment Scripts

### **Automated Deployment**
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Starting SUVIDHA Deployment..."

# Backend
echo "📦 Deploying Backend..."
cd suvidha-backend
npm ci --production
railway up

# Frontend  
echo "🎨 Deploying Frontend..."
cd ../suvidha-frontend
npm ci --production
npm run build
vercel --prod

echo "✅ Deployment Complete!"
echo "🌐 Frontend: https://yourdomain.com"
echo "🔧 Backend: https://api.yourdomain.com"
```

### **Docker Deployment**
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]

# Frontend Dockerfile  
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🧪 Testing Production

### **Pre-Launch Checklist**
- [ ] All environment variables set
- [ ] Database seeded with production data
- [ ] SSL certificates installed
- [ ] Health checks passing
- [ ] Load balancer configured
- [ ] CDN setup (optional)
- [ ] Monitoring tools configured
- [ ] Backup strategy implemented

### **Post-Launch Tests**
```bash
# Test authentication
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@suvidha.gov.in","password":"Admin@123"}'

# Test analytics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.yourdomain.com/api/analytics/overview

# Test frontend
curl -I https://yourdomain.com
```

---

## 📞 Support & Maintenance

### **Regular Maintenance**
- **Weekly**: Check logs and errors
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **Annually**: Performance review

### **Backup Strategy**
- **Database**: Daily automated backups
- **Code**: Git version control
- **Assets**: CDN backup
- **Configuration**: Environment versioning

### **Troubleshooting**
```bash
# Check backend logs
pm2 logs suvidha-backend --lines 100

# Check frontend build logs
vercel logs your-project-name

# Database issues
# Check Supabase dashboard
# Verify RLS policies
```

---

## 🎯 Production URLs

### **After Deployment**
- **Frontend**: `https://yourdomain.com`
- **Backend API**: `https://api.yourdomain.com/api`
- **Health Check**: `https://api.yourdomain.com/health`
- **Admin Access**: `https://yourdomain.com/login`

### **Demo Credentials (Change in Production!)**
- **Super Admin**: `admin@suvidha.gov.in` / `Admin@123`
- **Dept Admin**: `electricity.admin@suvidha.gov.in` / `Admin@123`
- **Operator**: Various operator emails / `Admin@123`

---

## 📈 Performance Optimization

### **Frontend**
- Enable gzip compression
- Implement code splitting
- Use CDN for static assets
- Optimize images and fonts
- Enable browser caching

### **Backend**
- Database connection pooling
- API response caching
- Implement Redis for sessions
- Use CDN for file uploads

---

## 🆘 Emergency Procedures

### **Rollback Plan**
```bash
# Quick rollback
git checkout previous-stable-tag
./deploy.sh

# Database rollback
# Use Supabase point-in-time recovery
```

### **Incident Response**
1. **Alert**: Monitor uptime and error rates
2. **Assess**: Check logs and identify issue
3. **Communicate**: Notify users of downtime
4. **Fix**: Deploy hotfix or rollback
5. **Review**: Post-mortem and prevention

---

## 📞 Deployment Support

For deployment issues:
1. Check this guide's troubleshooting section
2. Review logs for specific error messages
3. Verify environment variables are correct
4. Test database connectivity
5. Validate SSL certificates

**Ready for production deployment! 🚀**
