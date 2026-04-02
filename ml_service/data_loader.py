# data_loader.py
import os
from PIL import Image
from torch.utils.data import Dataset

class DRDataset(Dataset):
    """
    Dataset that accepts either a single root directory or a list of root directories.
    Each root should contain class subfolders, e.g.:
      /path/to/colord_image/Mild/*.jpg
      /path/to/colord_image/Moderate/*.jpg
      ...
    """

    def __init__(self, root_dirs, transform=None):
        if isinstance(root_dirs, str):
            root_dirs = [root_dirs]

        self.samples = []
        self.class_to_idx = {}
        idx = 0

        for root in root_dirs:
            if not os.path.isdir(root):
                continue

            # Scan each subfolder as a class
            for class_name in os.listdir(root):
                class_dir = os.path.join(root, class_name)
                if not os.path.isdir(class_dir):
                    continue

                if class_name not in self.class_to_idx:
                    self.class_to_idx[class_name] = idx
                    idx += 1

                # Collect all images in this class folder
                for fname in os.listdir(class_dir):
                    if fname.lower().endswith(('.png', '.jpg', '.jpeg')):
                        self.samples.append((os.path.join(class_dir, fname), self.class_to_idx[class_name]))

        if len(self.samples) == 0:
            raise RuntimeError(f"No images found in the provided directories: {root_dirs}")

        self.transform = transform

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        img = Image.open(path).convert('RGB')
        if self.transform is not None:
            img = self.transform(img)
        return img, label
