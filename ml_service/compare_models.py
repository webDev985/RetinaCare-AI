import pandas as pd
import matplotlib.pyplot as plt

models = ["resnet50", "densenet", "efficientnet", "vit"]

best_model = None
best_acc = 0

for model in models:
    df = pd.read_csv(f"results/{model}_results.csv")

    # Use val_acc instead of test_acc
    plt.plot(df["epoch"], df["val_acc"], label=model)

    final_acc = df["val_acc"].iloc[-1]
    print(f"{model} Final Accuracy: {final_acc:.4f}")

    if final_acc > best_acc:
        best_acc = final_acc
        best_model = model

plt.xlabel("Epoch")
plt.ylabel("Validation Accuracy")
plt.title("Model Comparison")
plt.legend()
plt.grid()

plt.show()

print("\n --> Best Model:", best_model)
print(" --> Best Accuracy:", best_acc)