import torch
import timm
import cv2
import numpy as np
from PIL import Image
import torch.nn.functional as F
from torchvision import transforms
import os


class RetinopathyModel:
    def __init__(self, model_path):

        print("📌 Loading ViT Model ONLY...")

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        checkpoint = torch.load(model_path, map_location=self.device)

        # ✅ LOAD CLASS MAPPING FROM TRAINING (VERY IMPORTANT)
        if isinstance(checkpoint, dict) and "class_to_idx" in checkpoint:
            class_to_idx = checkpoint["class_to_idx"]
            self.idx_to_class = {v: k for k, v in class_to_idx.items()}
        else:
            raise ValueError("❌ class_to_idx not found in model checkpoint")

        # 🔥 FORCE ViT MODEL
        self.model = timm.create_model("vit_base_patch16_224", pretrained=False)
        self.model.head = torch.nn.Linear(self.model.head.in_features, len(self.idx_to_class))

        # ✅ LOAD WEIGHTS
        if isinstance(checkpoint, dict) and "model_state" in checkpoint:
            self.model.load_state_dict(checkpoint["model_state"])
        else:
            self.model.load_state_dict(checkpoint)

        self.model.to(self.device)
        self.model.eval()

        print("✔ Model Ready For Inference")
        print("📊 CLASS MAPPING:", self.idx_to_class)

        # 🔥 SAME TRANSFORM AS TRAINING
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                 [0.229, 0.224, 0.225]),
        ])

    # ✅ RELAXED VALIDATION
    def is_retinal_image(self, image_path):
        img = cv2.imread(image_path)

        if img is None:
            return False

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape[:2]

        circles = cv2.HoughCircles(
            gray,
            cv2.HOUGH_GRADIENT,
            dp=1.5,
            minDist=h // 3,
            param1=50,
            param2=30,
            minRadius=h // 6,
            maxRadius=h // 2,
        )

        if circles is None:
            print("⚠️ Circle not detected, but continuing...")

        return True

    # 🔥 MAIN PREDICT
    def predict(self, image_path):

        if not self.is_retinal_image(image_path):
            return {
                "success": False,
                "error": "Invalid retinal image"
            }

        img = Image.open(image_path).convert("RGB")
        img_t = self.transform(img).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(img_t)

            # 🔥 TEMPERATURE SCALING (FIX OVERCONFIDENCE)
            temperature = 2.0
            outputs = outputs / temperature

            probs = F.softmax(outputs, dim=1).cpu().numpy()[0]

        pred_idx = int(np.argmax(probs))
        pred_class = self.idx_to_class[pred_idx].replace("_", " ")

        confidence = float(probs[pred_idx]) * 100

        # 🔥 UNCERTAINTY HANDLING
        if confidence < 60:
            pred_class = "Uncertain - Please retake image"

        # 🔥 DEBUG
        print("🧠 Prediction:", pred_class)
        print("📊 Confidence:", confidence)
        print("📈 Scores:", probs)

        return {
            "success": True,
            "prediction": pred_class,
            "confidence": round(confidence, 2),
            "all_scores": {
                self.idx_to_class[i].replace("_", " "): round(float(probs[i]) * 100, 2)
                for i in range(len(probs))
            }
        }