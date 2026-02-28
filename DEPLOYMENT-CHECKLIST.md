# 🚀 SUVIDHA Deployment Checklist

## Pre-Deployment Checklist

### **Environment Setup**
- [ ] Node.js 18+ installed locally
- [ ] Git repository initialized and pushed to main
- [ ] Vercel account created and CLI installed
- [ ] Render account created and configured
- [ ] Supabase project set up with tables created
- [ ] Environment variables configured (see .env.example files)

### **Code Quality**
- [ ] All tests passing locally
- [ ] Build process works without errors
- [ ] No console errors in production build
- [ ] Environment variables properly referenced
- [ ] API endpoints tested locally

### **Security**
- [ ] Default passwords changed for production
- [ ] Supabase RLS policies configured
- [ ] JWT secrets generated for production
- [ ] HTTPS/SSL certificates configured
- [ ] CORS settings verified for production domains

### **Performance**
- [ ] Bundle size optimized (< 1MB recommended)
- [ ] Images optimized and compressed
- [ ] Caching headers configured
- [ ] CDN configuration ready
- [ ] Database indexes optimized

---

## Deployment Commands

### **Option 1: Quick Deploy**
```bash
# Deploy everything at once
./deploy-vercel-render.sh production
```

### **Option 2: Step-by-Step Deploy**

#### **Backend to Render**
```bash
cd suvidha-backend
render deploy
```

#### **Frontend to Vercel**
```bash
cd suvidha-frontend
npm run build
vercel --prod
```

---

## Post-Deployment Verification

### **Health Checks**
- [ ] Backend health endpoint responding: `https://your-backend.onrender.com/health`
- [ ] Frontend loading successfully: `https://your-frontend.vercel.app`
- [ ] API proxy working: Test analytics endpoint
- [ ] Database connectivity: Test login with demo user
- [ ] All static assets loading: No 404 errors

### **Functionality Tests**
- [ ] User authentication working
- [ ] Dashboard loading with real data
- [ ] All navigation routes functional
- [ ] Analytics displaying correctly
- [ ] Responsive design working on mobile
- [ ] Dark mode toggle working
- [ ] Logout functionality working

### **Performance Monitoring**
- [ ] Page load times < 3 seconds
- [ ] Bundle sizes within limits
- [ ] No memory leaks in browser
- [ ] API response times < 500ms
- [ ] Database query times optimized

---

## Common Issues & Solutions

### **Build Failures**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build

# Check for missing dependencies
npm audit
```

### **Deployment Failures**
```bash
# Check Vercel logs
vercel logs

# Check Render logs
render logs

# Verify environment variables
echo $VITE_API_URL
echo $SUPABASE_URL
```

### **API Connection Issues**
```bash
# Test backend directly
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'

# Check CORS headers
curl -I https://your-backend.onrender.com/api/analytics/overview
```

### **Database Issues**
```bash
# Verify Supabase connection
# Check RLS policies in Supabase dashboard
# Test table access with different user roles
```

---

## Production URLs

### **After Successful Deployment**
- **Frontend**: `https://suvidha-admin.vercel.app`
- **Backend API**: `https://suvidha-backend.onrender.com/api`
- **Health Check**: `https://suvidha-backend.onrender.com/health`
- **Analytics**: `https://suvidha-admin.vercel.app/analytics`
- **Login**: `https://suvidha-admin.vercel.app/login`

### **Environment Variables Required**
Update these in your platform dashboards:

**Render (Backend)**:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `CLIENT_URL`: Your Vercel frontend URL
- `RAZORPAY_KEY_ID`: Production Razorpay key
- `RAZORPAY_KEY_SECRET`: Production Razorpay secret
- `JWT_SECRET`: Secure JWT secret for production

**Vercel (Frontend)**:
- `VITE_API_URL`: Your Render backend URL with `/api`
- `VITE_ENVIRONMENT`: `production`

---

## Monitoring Setup

### **Recommended Tools**
- **Uptime monitoring**: UptimeRobot or Pingdom
- **Error tracking**: Sentry or Vercel Analytics
- **Performance monitoring**: Vercel Speed Insights
- **Log aggregation**: Vercel logs + Render logs
- **Database monitoring**: Supabase dashboard

### **Alert Configuration**
- Set up alerts for:
  - Downtime > 5 minutes
  - Error rate > 5%
  - Response time > 2 seconds
  - Database connection failures
  - SSL certificate expiration

---

## Rollback Plan

### **Emergency Rollback**
```bash
# Quick rollback to previous version
git checkout previous-stable-tag
./deploy-vercel-render.sh production

# Database rollback if needed
# Use Supabase point-in-time recovery feature
```

### **Hotfix Deployment**
```bash
# Create hotfix branch
git checkout -b hotfix/issue-description

# Fix and test
# Make changes and test locally

# Merge and deploy
git checkout main
git merge hotfix/issue-description
git push origin main
./deploy-vercel-render.sh production
```

---

## Success Criteria

### **Deployment Successful When:**
- ✅ All health checks passing
- ✅ Demo users can log in successfully
- ✅ Analytics showing real data from database
- ✅ All pages load without errors
- ✅ Mobile responsive design working
- ✅ Performance metrics within acceptable ranges
- ✅ Security headers properly configured
- ✅ SSL certificates valid and working

---

**Ready for production deployment! 🚀**
