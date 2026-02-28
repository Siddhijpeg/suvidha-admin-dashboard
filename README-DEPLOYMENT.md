# 🚀 SUVIDHA Admin Dashboard - Deployment Guide

## Quick Start

### **1. One-Click Deployment (Easiest)**
```bash
# Deploy to Railway (Backend) + Vercel (Frontend)
./deploy.sh production
```

### **2. Manual Deployment**
```bash
# Backend (Railway)
cd suvidha-backend
railway up

# Frontend (Vercel)
cd suvidha-frontend
vercel --prod
```

### **3. Docker Deployment**
```bash
# Using Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Build and run containers
docker build -t suvidha-backend ./suvidha-backend
docker build -t suvidha-frontend ./suvidha-frontend
```

---

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Railway account (for backend)
- [ ] Vercel account (for frontend)
- [ ] Supabase project configured
- [ ] Custom domain (optional)
- [ ] SSL certificate (recommended)

---

## 🔧 Environment Setup

### **Backend (.env)**
```bash
NODE_ENV=production
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLIENT_URL=https://yourdomain.com
RAZORPAY_KEY_ID=rzp_live_your_key_id
JWT_SECRET=your_secure_secret
```

### **Frontend (.env.production)**
```bash
VITE_API_URL=https://your-api-domain.com/api
VITE_ENVIRONMENT=production
VITE_ENABLE_ANALYTICS=true
```

---

## 🌐 Deployment Options

### **Option 1: Railway + Vercel (Recommended)**
- **Backend**: Railway (Node.js hosting)
- **Frontend**: Vercel (React hosting)
- **Pros**: Easy setup, auto-scaling, good performance
- **Cons**: Vendor lock-in, limited control

### **Option 2: Docker + Cloud Server**
- **Backend**: Docker container on your server
- **Frontend**: Nginx serving static files
- **Pros**: Full control, customizable, cheaper long-term
- **Cons**: More maintenance, need server admin

### **Option 3: VPS + Manual Setup**
- **Backend**: PM2 process manager
- **Frontend**: Nginx reverse proxy
- **Pros**: Maximum control, cheapest option
- **Cons**: Requires technical expertise

---

## 📊 Monitoring & Maintenance

### **Health Checks**
```bash
# Backend health
curl https://api.yourdomain.com/health

# Frontend availability
curl -I https://yourdomain.com
```

### **Log Management**
```bash
# Railway logs
railway logs suvidha-backend

# Vercel logs
vercel logs suvidha-frontend

# Docker logs
docker-compose logs -f
```

### **Performance Monitoring**
- Set up Google Analytics
- Monitor error rates
- Track response times
- Database performance metrics

---

## 🔒 Security Best Practices

### **Production Security**
1. **Change default passwords** immediately
2. **Enable HTTPS** with SSL certificates
3. **Set up firewalls** properly
4. **Regular updates** of dependencies
5. **Backup strategy** for data protection

### **API Security**
- Rate limiting enabled
- CORS configured for your domain only
- JWT tokens with proper expiration
- Request validation and sanitization

---

## 🆘 Troubleshooting

### **Common Issues**

#### **Backend Not Starting**
```bash
# Check environment variables
cat suvidha-backend/.env

# Check logs
railway logs suvidha-backend

# Test database connection
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

#### **Frontend Build Errors**
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build

# Check environment
cat suvidha-frontend/.env.production
```

#### **Database Connection Issues**
```bash
# Verify Supabase credentials
# Check RLS policies
# Test connection from backend
```

---

## 📈 Scaling Guide

### **When to Scale**
- CPU usage > 80%
- Memory usage > 85%
- Response time > 2 seconds
- Error rate > 5%

### **Scaling Options**
1. **Vertical Scaling**: Increase server resources
2. **Horizontal Scaling**: Add more server instances
3. **Database Scaling**: Upgrade Supabase plan
4. **CDN Scaling**: Add edge locations

---

## 📞 Support

### **Documentation**
- [Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./suvidha-backend/docs/api.md)
- [Frontend Documentation](./suvidha-frontend/docs/components.md)

### **Emergency Contacts**
- **Infrastructure**: Railway/Vercel support
- **Database**: Supabase support
- **Domain**: Domain registrar support

---

## 🎯 Success Metrics

### **Launch Checklist**
- [ ] All health checks passing
- [ ] Demo users working
- [ ] Analytics tracking data
- [ ] SSL certificate valid
- [ ] Performance benchmarks met
- [ ] Monitoring alerts configured

### **Post-Launch**
- [ ] Monitor first 24 hours closely
- [ ] Check user feedback
- [ ] Review error logs
- [ ] Optimize based on real usage

---

**🚀 Ready for production deployment!**

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
