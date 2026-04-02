from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import shutil
from inference import RetinopathyModel

app = FastAPI()

model = RetinopathyModel("models/vit_best.pth")
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
    uvicorn.run(app, host="localhost", port=8001)
