FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV and common Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["python", "app.py"]

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "${PORT:-8001}"]
