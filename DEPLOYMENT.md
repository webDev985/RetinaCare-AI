# DR Detection - Deployment Guide

## Project Deployment Status

### ✅ Successfully Deployed

#### 1. **Frontend (React + Vite)**

- **URL**: https://frontend-dwse8jws9-webdev985s-projects.vercel.app
- **Platform**: Vercel
- **Status**: ✅ Live in Production
- **Alias**: https://frontend-three-lime-58.vercel.app

#### 2. **Backend (Node.js + Express)**

- **URL**: https://backend-6cly9nqdo-webdev985s-projects.vercel.app
- **Platform**: Vercel (Serverless Functions)
- **Status**: ✅ Live in Production
- **Alias**: https://backend-alpha-red-34.vercel.app
- **Database**: Connected to MongoDB (ensure MONGO_URI env var is set in Vercel)

### ⚠️ ML Service - Requires Alternative Deployment

The ML service (FastAPI + PyTorch) cannot be deployed on Vercel due to:

- **Issue**: PyTorch dependencies exceed 5GB (Vercel's limit is 500MB)
- **Reason**: Large pre-trained model files and deep learning libraries

### 🚀 Recommended Solutions for ML Service

#### Option 1: Railway.app (Recommended for your use case)

1. Sign up at https://railway.app
2. Create a new project
3. Connect your GitHub repository
4. Configure environment: Select Python 3.11
5. Set start command: `python -m uvicorn app:app --host 0.0.0.0 --port $PORT`

#### Option 2: Render.com

1. Sign up at https://render.com
2. Select "New +" → "Web Service"
3. Connect GitHub repo
4. Choose Python as runtime
5. Build command: `pip install -r requirements.txt`
6. Start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

#### Option 3: Google Cloud Run

1. Install gcloud CLI
2. Build & push Docker image:
   ```bash
   docker build -t ml-service .
   gcloud run deploy ml-service --image [IMAGE_URL]
   ```

### 📋 Configuration Steps

#### For the deployed services to work together:

1. **Update Frontend API Base URL**
   - In production, change API calls to point to the backend URL
   - If using environment variables in Vite, add to `.env.production`:
     ```
     VITE_API_URL=https://backend-alpha-red-34.vercel.app
     VITE_ML_URL=https://your-ml-service-url.com
     ```

2. **Backend Environment Variables** (Set in Vercel Dashboard)

   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=production
   PORT=3000
   ```

3. **ML Service Environment Variables** (For your chosen platform)
   ```
   UPLOAD_FOLDER=/tmp/uploads
   MODEL_PATH=./models/vit_best.pth
   ```

### 📝 Next Steps

1. **Connect GitHub to Vercel** for automatic deployments:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Deployments will auto-trigger on git push

2. **Set Environment Variables in Vercel**:
   - Go to Project Settings → Environment Variables
   - Add MONGO_URI and other sensitive data

3. **Deploy ML Service**:
   - Choose one of the platforms above
   - Follow their deployment guide
   - Update frontend to call the ML service URL

4. **Test the full stack**:
   - Test frontend at: https://frontend-dwse8jws9-webdev985s-projects.vercel.app
   - Test backend at: https://backend-alpha-red-34.vercel.app
   - Test ML service once deployed

### 🔧 Local Development

To run the complete stack locally:

```bash
# Frontend
cd frontend
npm install && npm run dev

# Backend (in separate terminal)
cd backend
npm install && npm run dev

# ML Service (in separate terminal)
cd ml_service
python -m venv venv_py311
source venv_py311/bin/activate
pip install -r requirements.txt
python -m uvicorn app:app --reload
```

### 📞 Support

For detailed configuration and environment setup, refer to individual README files in each service folder.
