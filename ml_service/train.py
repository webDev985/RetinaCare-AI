import os
import csv
import time
import argparse
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from torchvision import transforms, models
import timm
from data_loader import DRDataset


# ------------------------------
# MODEL SELECTION
# ------------------------------
def get_model(model_name, num_classes):

    if model_name == "resnet50":
        model = models.resnet50(pretrained=True)
        model.fc = nn.Linear(model.fc.in_features, num_classes)

    elif model_name == "densenet":
        model = models.densenet121(pretrained=True)
        model.classifier = nn.Linear(model.classifier.in_features, num_classes)

    elif model_name == "efficientnet":
        model = models.efficientnet_b0(pretrained=True)
        model.classifier[1] = nn.Linear(model.classifier[1].in_features, num_classes)

    elif model_name == "vit":
        model = timm.create_model('vit_base_patch16_224', pretrained=True)
        model.head = nn.Linear(model.head.in_features, num_classes)

    else:
        raise ValueError("Invalid model")

    return model


# ------------------------------
# TRAIN FUNCTION
# ------------------------------
def train(root_dirs, model_name, epochs=5, batch_size=16, lr=3e-5):

    print(f"\n===== TRAINING {model_name.upper()} =====")

    results = []
    start_time = time.time()

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize([0.485,0.456,0.406],
                             [0.229,0.224,0.225])
    ])

    dataset = DRDataset(root_dirs, transform=transform)
    num_classes = len(dataset.class_to_idx)

    print("Classes:", dataset.class_to_idx)
    print("Total images:", len(dataset))

    # 70/30 split
    n = len(dataset)
    train_size = int(0.7 * n)
    val_size = n - train_size

    train_ds, val_ds = random_split(dataset, [train_size, val_size])

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print("Device:", device)

    model = get_model(model_name, num_classes).to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)

    best_acc = 0

    # ------------------------------
    # TRAIN LOOP
    # ------------------------------
    for epoch in range(1, epochs + 1):

        print(f"\n===== Epoch {epoch}/{epochs} =====")

        model.train()
        correct, total = 0, 0

        for step, (imgs, labels) in enumerate(train_loader, start=1):

            imgs, labels = imgs.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(imgs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            preds = outputs.argmax(1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

            # 🔥 LIVE PROGRESS (FIX)
            if step % 10 == 0:
                print(f"Step {step}/{len(train_loader)} | Loss: {loss.item():.4f}")

        train_acc = correct / total

        # VALIDATION
        model.eval()
        val_correct, val_total = 0, 0

        with torch.no_grad():
            for imgs, labels in val_loader:
                imgs, labels = imgs.to(device), labels.to(device)
                outputs = model(imgs)
                preds = outputs.argmax(1)

                val_correct += (preds == labels).sum().item()
                val_total += labels.size(0)

        val_acc = val_correct / val_total

        print(f"Epoch {epoch}: Train={train_acc:.4f} | Val={val_acc:.4f}")

        results.append({
            "epoch": epoch,
            "train_acc": train_acc,
            "val_acc": val_acc
        })

        if val_acc > best_acc:
            best_acc = val_acc
            os.makedirs("models", exist_ok=True)
            torch.save(model.state_dict(), f"models/{model_name}.pth")

    # ------------------------------
    # SAVE RESULTS
    # ------------------------------
    os.makedirs("results", exist_ok=True)

    with open(f"results/{model_name}_results.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["epoch", "train_acc", "val_acc"])
        writer.writeheader()
        writer.writerows(results)

    print(f"\nResults saved → results/{model_name}_results.csv")
    print("Training time:", round(time.time() - start_time, 2), "seconds")


# ------------------------------
# MAIN
# ------------------------------
if __name__ == "__main__":

    parser = argparse.ArgumentParser()

    parser.add_argument('--data', nargs='+', required=True)
    parser.add_argument('--model', required=True,
                        choices=["resnet50", "densenet", "efficientnet", "vit"])
    parser.add_argument('--epochs', type=int, default=5)

    args = parser.parse_args()

    train(args.data, args.model, epochs=args.epochs)