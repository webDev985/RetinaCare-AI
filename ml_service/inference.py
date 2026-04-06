import torch
import timm
import cv2
import numpy as np
from PIL import Image
import torch.nn.functional as F
from torchvision import transforms, models as tv_models


class RetinopathyModel:
    def __init__(self, model_path):

        print("📌 Loading ViT Model...")

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        checkpoint = torch.load(model_path, map_location=self.device)

        if isinstance(checkpoint, dict) and "class_to_idx" in checkpoint and "model_state" in checkpoint:
            self.class_to_idx = checkpoint["class_to_idx"]
            self.idx_to_class = {v: k for k, v in self.class_to_idx.items()}
            model_state = checkpoint["model_state"]
        else:
            model_state = checkpoint
            num_classes = None
            for key, value in model_state.items():
                if key.endswith("classifier.weight") or key.endswith("head.weight") or key.endswith("fc.weight"):
                    num_classes = value.shape[0]
                    break
            if num_classes is None:
                raise ValueError("Could not infer number of classes from the checkpoint")
            self.class_to_idx = {f"class_{i}": i for i in range(num_classes)}
            self.idx_to_class = {v: k for k, v in self.class_to_idx.items()}

        model_name = model_path.split(os.sep)[-1].lower()
        if "densenet" in model_name:
            self.model = tv_models.densenet121(pretrained=False)
            self.model.classifier = torch.nn.Linear(self.model.classifier.in_features, len(self.class_to_idx))
        elif "efficientnet" in model_name:
            self.model = tv_models.efficientnet_b0(pretrained=False)
            self.model.classifier[1] = torch.nn.Linear(self.model.classifier[1].in_features, len(self.class_to_idx))
        elif "resnet" in model_name:
            self.model = tv_models.resnet50(pretrained=False)
            self.model.fc = torch.nn.Linear(self.model.fc.in_features, len(self.class_to_idx))
        else:
            self.model = timm.create_model("vit_base_patch16_224", pretrained=False)
            self.model.head = torch.nn.Linear(self.model.head.in_features, len(self.class_to_idx))

        self.model.load_state_dict(model_state)
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