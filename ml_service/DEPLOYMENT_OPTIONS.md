# ML Service Deployment on Hugging Face Spaces

## Quick Deployment to Hugging Face Spaces

Hugging Face Spaces is ideal for ML applications and includes free GPU access for eligible compute.

### Step 1: Create a Hugging Face Account

- Visit https://huggingface.co and sign up
- Create access token at https://huggingface.co/settings/tokens

### Step 2: Prepare for Hugging Face Spaces

Create a `Dockerfile` in the ml_service folder:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libsm6 libxext6 libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose port
EXPOSE 7860

# Run the app
CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
```

### Step 3: Deploy

1. Go to https://huggingface.co/spaces
2. Click "Create new Space"
3. Select:
   - Space name: `diabetic-retinopathy-detection`
   - Choose "Docker" as the Space SDK
   - Set visibility to "Public"
4. Upload your files or connect GitHub
5. The Docker image will build automatically

### Step 4: Configure the Frontend

Update your API endpoint in the frontend:

```javascript
const ML_SERVICE_URL =
  "https://webdev985-diabetic-retinopathy-detection.hf.space";

// In your prediction API call:
const response = await fetch(`${ML_SERVICE_URL}/predict`, {
  method: "POST",
  body: formData,
});
```

### Alternative: Use Railway with Free Tier

Railway offers a better free tier than Vercel for ML services:

1. Go to https://railway.app
2. Create account and link GitHub
3. Create new project → Deploy from GitHub
4. Select your repository
5. Set environment variables
6. Railway will auto-detect it's Python and deploy

The estimated cost is minimal and you get 500 free execution hours per month.
