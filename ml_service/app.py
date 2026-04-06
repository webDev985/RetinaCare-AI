from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import shutil
from inference import RetinopathyModel

app = FastAPI()

model_path = os.environ.get("MODEL_PATH", "models/densenet.pth")
model = None
try:
    model = RetinopathyModel(model_path)
except Exception as e:
    print(f"❌ Failed to load ML model: {e}")
    model = None

UPLOAD_FOLDER = "temp_uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Allow Backend API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    if model is None:
        return {
            "success": False,
            "message": "ML model not available. Check MODEL_PATH and model file."
        }

    file_path = os.path.join(UPLOAD_FOLDER, image.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    result = model.predict(file_path)
    os.remove(file_path)

    # If validation failed
    if not result["success"]:
        return {
            "success": False,
            "message": result["error"]
        }

    return {
        "success": True,
        "ml": result
    }



@app.get("/")
def root():
    return {"msg": "ML Server Running ✔"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
