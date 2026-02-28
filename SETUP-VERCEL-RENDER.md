# 🚀 Vercel + Render Deployment Setup

## Quick Start

### **One-Command Deployment**
```bash
./deploy-vercel-render.sh production
```

---

## 📋 Prerequisites

### **Required Accounts**
- [ ] [Vercel Account](https://vercel.com/signup)
- [ ] [Render Account](https://render.com/register)
- [ ] [GitHub Account](https://github.com/signup)

### **Required Tools**
```bash
# Install CLI tools
npm install -g vercel
npm install -g render
```

---

## 🔧 Platform Setup

### **1. Render Setup (Backend)**

#### **Create Web Service**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure service:
   - **Name**: `suvidha-backend`
   - **Root Directory**: `suvidha-backend`
   - **Runtime**: `Node 18`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Health Check**: `/health`

#### **Environment Variables**
Add these in Render dashboard:
```bash
NODE_ENV=production
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLIENT_URL=https://suvidha-admin.vercel.app
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_secret_key
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
```

### **2. Vercel Setup (Frontend)**

#### **Create Project**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `suvidha-frontend`
   - **Build Command**: `cd suvidha-frontend && npm ci && npm run build`
   - **Output Directory**: `suvidha-frontend/dist`

#### **Environment Variables**
Add these in Vercel dashboard:
```bash
VITE_API_URL=https://suvidha-backend.onrender.com/api
VITE_ENVIRONMENT=production
VITE_ENABLE_ANALYTICS=true
```

#### **Custom Domain (Optional)**
```bash
# Add custom domain in Vercel dashboard
# Update DNS: CNAME -> cname.vercel.app
```

---

## 🚀 Deployment Commands

### **Automatic Deployment**
```bash
# Deploy to production
./deploy-vercel-render.sh production

# Deploy to staging
./deploy-vercel-render.sh staging
```

### **Manual Deployment**

#### **Backend (Render)**
```bash
# Using Render CLI
cd suvidha-backend
render deploy

# Or push to main branch (auto-deploy if configured)
git add .
git commit -m "Deploy to production"
git push origin main
```

#### **Frontend (Vercel)**
```bash
# Using Vercel CLI
cd suvidha-frontend
vercel --prod

# Or push to main branch (auto-deploy if configured)
git add .
git commit -m "Deploy to production"
git push origin main
```

---

## 🔗 Platform Integration

### **API Proxy Configuration**
The `vercel.json` file automatically routes API calls to Render:

```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://suvidha-backend.onrender.com/api/$1"
    }
  ]
}
```

### **CORS Configuration**
Backend automatically allows requests from your Vercel domain via `CLIENT_URL` environment variable.

---

## 📊 Deployment URLs

### **After Deployment**
- **Frontend**: `https://suvidha-admin.vercel.app`
- **Backend API**: `https://suvidha-backend.onrender.com/api`
- **Health Check**: `https://suvidha-backend.onrender.com/health`
- **Analytics**: `https://suvidha-admin.vercel.app/analytics`

### **Custom Domains**
- **Frontend**: Update in Vercel dashboard
- **Backend**: Update in Render dashboard
- **DNS**: Configure CNAME records as needed

---

## 🔒 Security Configuration

### **Production Security**
1. **Update Environment Variables** in both dashboards
2. **Enable HTTPS** (automatic on both platforms)
3. **Configure Firewalls** through platform settings
4. **Set Up Monitoring** and alerts
5. **Regular Updates** of dependencies

### **API Security**
- Render provides DDoS protection
- Vercel provides edge security
- CORS configured for your domains
- Rate limiting enabled in backend

---

## 📈 Monitoring

### **Render Monitoring**
- Built-in metrics at dashboard.render.com
- Log streaming and error tracking
- Performance metrics and alerts
- Health check monitoring

### **Vercel Analytics**
- Built-in analytics at vercel.com/analytics
- Real user metrics and performance
- Error tracking and debugging
- Edge performance insights

---

## 🆘 Troubleshooting

### **Common Issues**

#### **Backend Deployment Issues**
```bash
# Check Render logs
render logs

# Check environment variables
# View in Render dashboard

# Test health endpoint
curl https://suvidha-backend.onrender.com/health
```

#### **Frontend Deployment Issues**
```bash
# Check Vercel logs
vercel logs

# Check build logs
vercel logs your-project-name

# Test deployment
curl -I https://suvidha-admin.vercel.app
```

#### **API Connection Issues**
```bash
# Test API from frontend
curl https://suvidha-backend.onrender.com/api/analytics/overview

# Check CORS configuration
# Verify CLIENT_URL matches frontend domain
```

---

## 💡 Best Practices

### **Performance Optimization**
- Enable edge caching on Vercel
- Use Render's built-in CDN
- Optimize bundle sizes
- Enable compression

### **Cost Management**
- Monitor usage on both platforms
- Set up billing alerts
- Use appropriate tiers for traffic
- Regular cost reviews

### **Development Workflow**
- Use feature branches
- Test in staging environment
- PR reviews before deployment
- Automated testing in CI/CD

---

## 🎯 Success Checklist

### **Pre-Launch**
- [ ] Environment variables configured
- [ ] Custom domains set up
- [ ] SSL certificates active
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Demo users working

### **Post-Launch**
- [ ] Monitor first 24 hours
- [ ] Check error rates
- [ ] Review performance metrics
- [ ] Test all user flows
- [ ] Set up alerts

---

**🚀 Ready for Vercel + Render deployment!**

This setup provides:
- ✅ **Automatic deployments** with single command
- ✅ **Zero-downtime deployments** 
- ✅ **Built-in monitoring** and logging
- ✅ **Global CDN** with Vercel edge network
- ✅ **Scalable infrastructure** with Render
- ✅ **Production security** best practices
- ✅ **Cost-effective** hosting solution

Deploy now with `./deploy-vercel-render.sh production`!
