import os
from PIL import Image
from torch.utils.data import Dataset

class DRDataset(Dataset):

    def __init__(self, root_dirs, transform=None):
        if isinstance(root_dirs, str):
            root_dirs = [root_dirs]

        self.samples = []

        # 🔥 FIXED CLASS ORDER (VERY IMPORTANT)
        self.class_names = [
            "No_DR",
            "Mild",
            "Moderate",
            "Severe",
            "Proliferate_DR"
        ]

        self.class_to_idx = {cls: i for i, cls in enumerate(self.class_names)}

        for root in root_dirs:
            if not os.path.isdir(root):
                continue

            for class_name in self.class_names:   # 🔥 FIXED ORDER
                class_dir = os.path.join(root, class_name)

                if not os.path.isdir(class_dir):
                    print(f"⚠️ Missing folder: {class_name}")
                    continue

                for fname in os.listdir(class_dir):
                    if fname.lower().endswith(('.png', '.jpg', '.jpeg')):
                        self.samples.append(
                            (os.path.join(class_dir, fname),
                             self.class_to_idx[class_name])
                        )

        if len(self.samples) == 0:
            raise RuntimeError(f"No images found in {root_dirs}")

        self.transform = transform

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        img = Image.open(path).convert('RGB')

        if self.transform:
            img = self.transform(img)

        return img, label