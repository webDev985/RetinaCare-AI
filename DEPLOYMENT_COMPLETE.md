# DR Detection - Complete Deployment Guide

## 🎉 Project Deployment Complete (Partial)

Your DR Detection project has been successfully deployed to Vercel! Here's the current status:

## ✅ DEPLOYED SERVICES

### 1. Frontend (React Application)

- **Live URL**: https://frontend-dwse8jws9-webdev985s-projects.vercel.app
- **Backup URL**: https://frontend-three-lime-58.vercel.app
- **What's Deployed**:
  - React application with Vite
  - All UI components and pages
  - Leaflet maps integration
  - PDF report generation

### 2. Backend API (Node.js/Express)

- **Live URL**: https://backend-6cly9nqdo-webdev985s-projects.vercel.app
- **Backup URL**: https://backend-alpha-red-34.vercel.app
- **What's Deployed**:
  - Express server with API routes
  - Authentication endpoints
  - Report management
  - Hospital listings
  - File upload handling via Multer

## ⚠️ REMAINING TASK: ML Service Deployment

The PyTorch-based ML prediction service requires additional setup due to size constraints.

### Current Issue

- Vercel's serverless functions have a 500MB limit
- PyTorch + models = ~5GB
- Solution: Deploy to alternative platform

### Choose Your Deployment Method

#### 🥇 RECOMMENDED: Railway.app

**Best for**: Production ML services
**Cost**: $5/month or free tier with limits
**Steps**:

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub"
4. Connect your repository
5. Railway auto-detects Python and deploys
6. Get your live URL

#### 🥈 Alternative: Hugging Face Spaces

**Best for**: Free deployment with easy sharing
**Cost**: FREE
**Steps**:

1. Create account at https://huggingface.co
2. Go to https://huggingface.co/spaces
3. Create new Space → Select Docker
4. Upload the ml_service folder
5. Gets deployed automatically
6. Get your live URL

#### 🥉 Alternative: Render

**Best for**: Good free tier
**Cost**: Free with generous limits
**Steps**:

1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub
4. Select Python 3.11
5. Start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
6. Deploy

## 📝 Configuration Steps

### Step 1: Set Backend Environment Variables

Go to https://vercel.com/dashboard

1. Click on "backend" project
2. Settings → Environment Variables
3. Add these variables:
   ```
   MONGO_URI=your_connection_string
   JWT_SECRET=any_secret_key
   NODE_ENV=production
   ```

### Step 2: Connect Frontend to Backend

Update frontend `src/api.js` or wherever API calls are made:

```javascript
const API_BASE_URL = "https://backend-alpha-red-34.vercel.app/api";
// or use environment variable:
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://backend-alpha-red-34.vercel.app/api";
```

### Step 3: Deploy ML Service

Follow one of the guides above (Railway recommended).

### Step 4: Connect Frontend to ML Service

Update your frontend prediction code:

```javascript
// If using Railway:
const ML_URL = "https://your-railway-url.railway.app/predict";

// If using Hugging Face:
const ML_URL = "https://your-username-your-space.hf.space/predict";

// Then in your prediction function:
const formData = new FormData();
formData.append("image", imageFile);

const response = await fetch(ML_URL, {
  method: "POST",
  body: formData,
});
```

## 🔍 Testing Your Deployment

### Test Frontend

Visit: https://frontend-dwse8jws9-webdev985s-projects.vercel.app

### Test Backend

```bash
curl https://backend-alpha-red-34.vercel.app
# Should return: "Backend API Running ✔"
```

### Test API Endpoint

```bash
curl https://backend-alpha-red-34.vercel.app/api/auth/status
```

## 🚀 What's Next

1. **Deploy ML Service** (Choose from options above)
   - Takes 5-10 minutes
   - Get the live URL
   - Add to frontend environment variables

2. **Update Frontend Configuration**
   - Add ML service URL to your API configuration
   - Update backend URL if needed
   - Test prediction endpoint

3. **Connect GitHub to Vercel** (Optional but recommended)
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Auto-deploy on every push

4. **Set Custom Domain** (Optional)
   - In Vercel dashboard
   - Add your own domain
   - Update frontend URL

5. **Monitor and Maintain**
   - Check Vercel logs: https://vercel.com/dashboard
   - Monitor API performance
   - Watch for errors

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   End User's Browser                 │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│  Frontend (Vercel) - React App                      │
│  https://frontend-dwse8jws9-webdev985s-projects...  │
└─────────────────────────────────────────────────────┘
         │                               │
         ▼                               ▼
    ┌────────────┐              ┌──────────────┐
    │  Backend   │              │ ML Service   │
    │  (Vercel)  │              │ (Railway/HF) │
    │  Node.js   │◄────────────►│  FastAPI     │
    │  Express   │              │  PyTorch     │
    └────────────┘              └──────────────┘
         │
         ▼
    ┌────────────┐
    │  MongoDB   │
    │  Database  │
    └────────────┘
```

## 💡 Tips & Best Practices

1. **Environment Variables**: Never commit `.env` files, use Vercel dashboard
2. **API Calls**: Use relative URLs when possible for flexibility
3. **CORS**: Backend already has CORS enabled for all origins
4. **File Uploads**: Multer handles uploads to `/uploads` folder
5. **Monitoring**: Set up alerts on Vercel dashboard

## 🆘 Troubleshooting

### "Backend not responding"

- Check Vercel logs: https://vercel.com/dashboard → backend → logs
- Verify MONGO_URI is set correctly
- Check MongoDB connection string has network access enabled

### "ML Service returning 404"

- Verify ML service URL is correct in frontend
- Check ML service is running and accessible
- Inspect network tab in browser dev tools

### "Large file upload failing"

- Vercel has 50MB timeout
- Multer has file size limits in backend
- Check `backend/routes/report.js` for limits

### "CORS errors"

- Backend already has CORS enabled
- Verify frontend URL is making valid requests
- Check headers in network requests

## 📞 Support & Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Express Docs**: https://expressjs.com
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **React Docs**: https://react.dev
- **MongoDB Docs**: https://docs.mongodb.com

---

**Deployment Date**: April 7, 2026
**Status**: Frontend ✅ | Backend ✅ | ML Service ⏳ (Ready for deployment)
**Total Uptime**: 24/7 (Vercel reliability)
