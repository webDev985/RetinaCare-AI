import csv
import time
import os
import argparse
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from torchvision import transforms, models
from data_loader import DRDataset


def train(root_dirs, save_path='models/cnn_best.pth', epochs=8, batch_size=16, lr=3e-5):

    print("\n===== STARTING CNN TRAINING =====")
    print("Scanning dataset...")

    #  START tracking results
    results = []
    start_time = time.time()

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])
    ])

    dataset = DRDataset(root_dirs, transform=transform)

    if len(dataset) == 0:
        raise RuntimeError(f'No images found under: {root_dirs}')

    num_classes = len(dataset.class_to_idx)

    print(f'Classes found ({num_classes}): {dataset.class_to_idx}')
    print(f"Total images found: {len(dataset)}")

    # 70/30 split
    n = len(dataset)
    train_size = int(0.7 * n)
    val_size = n - train_size

    print(f"Train size: {train_size}, Validation size: {val_size}")

    train_ds, val_ds = random_split(dataset, [train_size, val_size])

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=0)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print("Using device:", device)

    # Load CNN model (ResNet50)
    print("Loading CNN model (ResNet50)...")

    model = models.resnet50(pretrained=True)

    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, num_classes)

    model = model.to(device)

    print("Model loaded and moved to device.\n")

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=3, gamma=0.1)

    os.makedirs(os.path.dirname(save_path) or '.', exist_ok=True)

    best_acc = 0.0

    # Training loop
    for epoch in range(1, epochs + 1):

        print(f"\n===== Epoch {epoch}/{epochs} =====")

        model.train()

        running_loss = 0
        total = 0
        correct = 0

        for step, (imgs, labels) in enumerate(train_loader, start=1):

            imgs = imgs.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()

            outputs = model(imgs)

            loss = criterion(outputs, labels)

            loss.backward()

            optimizer.step()

            running_loss += loss.item() * imgs.size(0)

            preds = outputs.argmax(dim=1)

            correct += (preds == labels).sum().item()
            total += labels.size(0)

            if step % 5 == 0:
                print(f"Step {step}/{len(train_loader)} | Loss: {loss.item():.4f}")

        train_loss = running_loss / total
        train_acc = correct / total

        # Validation

        model.eval()

        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for imgs, labels in val_loader:

                imgs = imgs.to(device)
                labels = labels.to(device)

                outputs = model(imgs)

                preds = outputs.argmax(dim=1)

                val_correct += (preds == labels).sum().item()
                val_total += labels.size(0)

        val_acc = val_correct / val_total if val_total > 0 else 0

        print(f"Epoch {epoch} Summary:")
        print(f"Train Loss: {train_loss:.4f}")
        print(f"Train Acc : {train_acc:.4f}")
        print(f"Val Acc   : {val_acc:.4f}")

        #  SAVE RESULTS EACH EPOCH
        results.append({
            "epoch": epoch,
            "train_acc": train_acc,
            "val_acc": val_acc
        })

        # Save best model
        if val_acc > best_acc:
            best_acc = val_acc

            checkpoint = {
                'model_state': model.state_dict(),
                'class_to_idx': dataset.class_to_idx
            }

            torch.save(checkpoint, save_path)

            print(f"🔥 New best model saved! (val_acc={val_acc:.4f})")

        scheduler.step()

    print("\n===== Training Completed =====")
    print("Best validation accuracy:", best_acc)
    print("Model saved at:", save_path)

    # ✅ SAVE CSV RESULTS
    end_time = time.time()
    total_time = end_time - start_time

    print(f"Training Time: {total_time:.2f} seconds")

    os.makedirs("results", exist_ok=True)

    with open("results/resnet50_results.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["epoch", "train_acc", "val_acc"])
        writer.writeheader()
        writer.writerows(results)

    print("Results saved: results/resnet50_results.csv")


# MAIN ENTRY
if __name__ == '__main__':

    parser = argparse.ArgumentParser()

    parser.add_argument('--data', nargs='+', required=True)
    parser.add_argument('--save', default='models/cnn_best.pth')
    parser.add_argument('--epochs', type=int, default=8)
    parser.add_argument('--batch_size', type=int, default=16)
    parser.add_argument('--lr', type=float, default=3e-5)

    args = parser.parse_args()

    train(args.data,
          save_path=args.save,
          epochs=args.epochs,
          batch_size=args.batch_size,
          lr=args.lr)