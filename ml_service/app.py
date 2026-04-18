from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import shutil
import uuid

from inference import RetinopathyModel

# from dotenv import load_dotenv
# load_dotenv()

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model_path = os.environ.get(
    "MODEL_PATH",
    os.path.join(BASE_DIR, "models", "vit_best.pth") #changed----path
)
print("📂 MODEL PATH:", model_path)


model = None
try:
    model = RetinopathyModel(model_path)
    print("✅ Model loaded successfully")
except Exception as e:
    print(f"❌ Failed to load ML model: {e}")
    model = None

UPLOAD_FOLDER = os.path.join(BASE_DIR, "temp_uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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
            "message": "ML model not available."
        }

    # ✅ VALIDATE FILE TYPE
    if not image.filename.lower().endswith((".jpg", ".jpeg", ".png")):
        return {
            "success": False,
            "message": "Invalid image format"
        }

    # ✅ UNIQUE FILE NAME
    unique_name = str(uuid.uuid4()) + "_" + image.filename
    file_path = os.path.join(UPLOAD_FOLDER, unique_name)

    try:
        # SAVE FILE
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        # 🔥 PREDICT
        print("📂 Image received:", image.filename)
        result = model.predict(file_path)

        # DEBUG LOGS (VERY IMPORTANT)
        print("🧠 Prediction:", result.get("prediction"))
        print("📊 Confidence:", result.get("confidence"))
        print("📈 Scores:", result.get("all_scores"))

        if not result["success"]:
            return {
                "success": False,
                "message": result["error"]
            }

        return {
            "success": True,
            "ml": result
        }

    except Exception as e:
        print("❌ Prediction Error:", e)
        return {
            "success": False,
            "message": "Prediction failed"
        }

    finally:
        # CLEANUP
        if os.path.exists(file_path):
            os.remove(file_path)


@app.get("/")
def root():
    return {"msg": "ML Server Running ✔"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")