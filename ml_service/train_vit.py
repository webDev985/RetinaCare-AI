import os
import argparse
import random
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, WeightedRandomSampler
import timm
from torchvision import transforms
from data_loader import DRDataset
from collections import Counter

def train(root_dirs, save_path='models/vit_best.pth', epochs=25, batch_size=16):

    print("\n===== HIGH ACCURACY ViT TRAINING =====")

    # 🔥 TRANSFORMS (balanced, not too aggressive)
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(0.2, 0.2, 0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    dataset = DRDataset(root_dirs, transform=transform)

    print("Classes:", dataset.class_to_idx)

    # 🔥 SHUFFLED SPLIT (IMPORTANT FIX)
    indices = list(range(len(dataset)))
    random.shuffle(indices)

    train_size = int(0.7 * len(indices))
    train_indices = indices[:train_size]
    val_indices = indices[train_size:]

    train_ds = torch.utils.data.Subset(dataset, train_indices)
    val_ds = torch.utils.data.Subset(dataset, val_indices)

    # 🔥 CLASS BALANCING
    targets = [dataset.samples[i][1] for i in train_indices]
    class_counts = Counter(targets)

    print("Class distribution:", class_counts)

    weights = [1.0 / class_counts[t] for t in targets]
    sampler = WeightedRandomSampler(weights, num_samples=len(weights), replacement=True)

    train_loader = DataLoader(train_ds, batch_size=batch_size, sampler=sampler)
    val_loader = DataLoader(val_ds, batch_size=batch_size)

    # 🔥 DEVICE
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("Using:", device)

    # 🔥 MODEL
    model = timm.create_model("vit_base_patch16_224", pretrained=True)
    model.head = nn.Linear(model.head.in_features, len(dataset.class_to_idx))
    model.to(device)

    # 🔥 LOSS + OPTIMIZER
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=3e-5)

    best_acc = 0

    for epoch in range(epochs):

        print(f"\n===== Epoch {epoch+1}/{epochs} =====")

        # ================= TRAIN =================
        model.train()
        correct = 0
        total = 0

        for i, (imgs, labels) in enumerate(train_loader):
            imgs, labels = imgs.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(imgs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            preds = outputs.argmax(1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

            # 🔥 LIVE LOG (VERY IMPORTANT)
            print(f"Batch {i+1}/{len(train_loader)} | Loss: {loss.item():.4f}", end="\r")

        train_acc = correct / total

        # ================= VALIDATION =================
        model.eval()
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for imgs, labels in val_loader:
                imgs, labels = imgs.to(device), labels.to(device)
                outputs = model(imgs)
                preds = outputs.argmax(1)
                val_correct += (preds == labels).sum().item()
                val_total += labels.size(0)

        val_acc = val_correct / val_total

        print(f"\nTrain Acc: {train_acc:.4f}")
        print(f"Val Acc  : {val_acc:.4f}")

        # 🔥 SAVE BEST MODEL
        if val_acc > best_acc:
            best_acc = val_acc

            torch.save({
                "model_state": model.state_dict(),
                "class_to_idx": dataset.class_to_idx
            }, save_path)

            print("🔥 BEST MODEL SAVED")

    print("\n✅ FINAL BEST ACCURACY:", best_acc)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", nargs="+", required=True)
    parser.add_argument("--epochs", type=int, default=25)
    parser.add_argument("--batch_size", type=int, default=16)

    args = parser.parse_args()

    train(args.data, epochs=args.epochs, batch_size=args.batch_size)