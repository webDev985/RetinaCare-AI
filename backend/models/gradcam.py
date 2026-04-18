import torch
import numpy as np
import cv2
import sys
import base64
from PIL import Image
from torchvision import transforms
import timm

# ✅ LOAD YOUR ViT MODEL (same architecture as training)
model = timm.create_model('vit_base_patch16_224', pretrained=True)
model.eval()

# ✅ TRANSFORM (must match training)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

def get_attention_map(model, x):
    attn_maps = []

    def hook(module, input, output):
        attn_maps.append(output)

    # Register hooks on attention blocks
    for blk in model.blocks:
        blk.attn.attn_drop.register_forward_hook(hook)

    _ = model(x)

    # Stack attentions
    attn = torch.stack(attn_maps)  # [layers, B, heads, tokens, tokens]
    attn = attn.mean(dim=2)        # average over heads

    # Attention rollout
    rollout = torch.eye(attn.size(-1))
    for i in range(attn.size(0)):
        rollout = rollout @ attn[i][0]

    # CLS token attention
    mask = rollout[0, 1:]
    size = int(mask.shape[0] ** 0.5)

    mask = mask.reshape(size, size).detach().numpy()
    mask = cv2.resize(mask, (224, 224))

    # Normalize
    mask = mask - mask.min()
    if mask.max() != 0:
        mask = mask / mask.max()

    return mask


def generate_vit_heatmap(img_path):
    img = Image.open(img_path).convert("RGB")
    img_np = np.array(img)

    input_tensor = transform(img).unsqueeze(0)

    mask = get_attention_map(model, input_tensor)

    heatmap = cv2.applyColorMap(np.uint8(255 * mask), cv2.COLORMAP_JET)

    # Blend with original image
    heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
    overlay = cv2.addWeighted(img_np, 0.6, heatmap, 0.4, 0)

    _, buffer = cv2.imencode('.png', overlay)
    return base64.b64encode(buffer).decode()


# ✅ CLI ENTRY
if __name__ == "__main__":
    img_path = sys.argv[1]
    result = generate_vit_heatmap(img_path)
    print(result)