# 🚀 Dashboard Deployment Guide
## Vercel + Render - Step by Step

---

## 📋 Prerequisites
- [x] Vercel CLI installed
- [x] vercel.json fixed and ready
- [ ] GitHub repository pushed
- [ ] Vercel account created
- [ ] Render account created

---

## 🔧 Step 1: Render Backend Setup

### **1. Create Web Service**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. **Connect Repository**: Select your GitHub `suvidha-admin-dashboard` repo
4. **Configure Service**:
   - **Name**: `suvidha-backend`
   - **Root Directory**: `suvidha-backend`
   - **Runtime**: `Node 18`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`

### **2. Environment Variables**
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

### **3. Deploy**
- Click **"Create Web Service"**
- Render will automatically build and deploy
- Wait for deployment to complete (green status)

---

## 🎨 Step 2: Vercel Frontend Setup

### **1. Create Project**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. **Import Repository**: Select your `suvidha-admin-dashboard` repo
4. **Framework**: Vercel will auto-detect "Vite"

### **2. Project Settings**
- **Project Name**: `suvidha-admin`
- **Root Directory**: `suvidha-frontend`
- **Build Command**: `cd suvidha-frontend && npm run build`
- **Output Directory**: `suvidha-frontend/dist`
- **Install Command**: `cd suvidha-frontend && npm ci`

### **3. Environment Variables**
Add these in Vercel dashboard:
```bash
VITE_API_URL=https://suvidha-backend.onrender.com/api
VITE_ENVIRONMENT=production
VITE_ENABLE_ANALYTICS=true
```

### **4. Deploy**
- Click **"Deploy"**
- Vercel will automatically build and deploy
- Wait for deployment to complete

---

## ✅ Step 3: Verify Deployment

### **Health Checks**
```bash
# Check backend health
curl https://suvidha-backend.onrender.com/health

# Check frontend
curl -I https://suvidha-admin.vercel.app
```

### **Test Application**
1. Visit: `https://suvidha-admin.vercel.app`
2. Login with: `admin@suvidha.gov.in` / `Admin@123`
3. Navigate to Analytics page
4. Verify real data is loading

---

## 🔗 API Proxy Configuration

The `vercel.json` file automatically routes API calls:
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

This means:
- Frontend calls `/api/login` → Routes to `https://suvidha-backend.onrender.com/api/login`
- Frontend calls `/api/analytics/overview` → Routes to backend
- No CORS issues - handled automatically

---

## 📊 Deployment URLs

### **After Deployment**
- **Frontend**: `https://suvidha-admin.vercel.app`
- **Backend**: `https://suvidha-backend.onrender.com`
- **API**: `https://suvidha-backend.onrender.com/api`
- **Health**: `https://suvidha-backend.onrender.com/health`

### **Important URLs**
- **Login**: `https://suvidha-admin.vercel.app/login`
- **Dashboard**: `https://suvidha-admin.vercel.app/dashboard`
- **Analytics**: `https://suvidha-admin.vercel.app/analytics`

---

## 🛠️ Troubleshooting

### **Common Issues**

#### **Backend Deployment Issues**
- **Check Render logs**: View in Render dashboard
- **Environment variables**: Verify all are set correctly
- **Build failures**: Check package.json and dependencies

#### **Frontend Deployment Issues**
- **Build errors**: Check Vercel build logs
- **API connection**: Verify VITE_API_URL matches backend URL
- **Environment variables**: Check Vercel dashboard settings

#### **API Connection Issues**
```bash
# Test backend directly
curl -X POST https://suvidha-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@suvidha.gov.in","password":"Admin@123"}'
```

---

## 🎯 Success Checklist

### **Deployment Complete When:**
- [ ] Backend health check returns 200
- [ ] Frontend loads without errors
- [ ] Login works with demo credentials
- [ ] Analytics shows real data
- [ ] All pages navigate correctly
- [ ] Mobile responsive design works

---

## 📞 Support

### **Platform Documentation**
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)

### **Dashboard Locations**
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Render Dashboard](https://dashboard.render.com)

---

## 🚀 Ready to Deploy!

**Total Time: ~20 minutes**
**Cost: Free tier on both platforms**

**Steps:**
1. **Render**: Create backend web service
2. **Vercel**: Create frontend project  
3. **Environment**: Set variables in both dashboards
4. **Deploy**: Both platforms auto-deploy
5. **Test**: Verify everything works

**Your SUVIDHA Admin Dashboard is ready for production!** 🎉
