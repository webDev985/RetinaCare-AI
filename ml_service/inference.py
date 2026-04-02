import torch
import timm
import cv2
import numpy as np
from PIL import Image
import torch.nn.functional as F
from torchvision import transforms


class RetinopathyModel:
    def __init__(self, model_path):

        print("📌 Loading ViT Model...")

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        checkpoint = torch.load(model_path, map_location=self.device)

        self.class_to_idx = checkpoint["class_to_idx"]
        self.idx_to_class = {v: k for k, v in self.class_to_idx.items()}

        self.model = timm.create_model("vit_base_patch16_224", pretrained=False)
        self.model.head = torch.nn.Linear(self.model.head.in_features, len(self.class_to_idx))

        self.model.load_state_dict(checkpoint["model_state"])
        self.model.to(self.device)
        self.model.eval()

        print("✔ Model Ready For Inference")

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                 [0.229, 0.224, 0.225]),
        ])

    # Retina Validation 
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
            return False

        mean_red = np.mean(img[:, :, 2])
        mean_green = np.mean(img[:, :, 1])

        if mean_red < mean_green:
            return False

        return True

    # Main Prediction 
    def predict(self, image_path):

        if not self.is_retinal_image(image_path):
            return {
                "success": False,
                "error": "Uploaded image is NOT a retinal fundus scan"
            }

        img = Image.open(image_path).convert("RGB")
        img_t = self.transform(img).unsqueeze(0).to(self.device)

        # IMPORTANT FIX: disable gradients
        with torch.no_grad():

            outputs = self.model(img_t)

            # Temperature scaling (reduces overconfidence)
            temperature = 1.5
            outputs = outputs / temperature

            probs = F.softmax(outputs, dim=1).cpu().numpy()[0]

        pred_idx = int(np.argmax(probs))
        pred_class = self.idx_to_class[pred_idx]

        return {
            "success": True,
            "prediction": pred_class,

            #  Convert to percentage
            "confidence": round(float(probs[pred_idx]) * 100, 2),

            #  Show full probability distribution
            "all_scores": {
                self.idx_to_class[i]: round(float(probs[i]) * 100, 2)
                for i in range(len(probs))
            }
        }