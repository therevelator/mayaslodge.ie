from PIL import Image, ImageDraw
import sys

SRC = "/Users/ionutapostu/Desktop/mayaslodge.ie/scripts/logo-original.webp"
OUT = "/Users/ionutapostu/Desktop/mayaslodge.ie/public/logo.png"

img = Image.open(SRC).convert("RGBA")
W, H = img.size

# 1) Crop off the "Maya's Lodge" wordmark at the bottom — keep just the clover.
#    The clover + stem sit in the top ~60% of the image.
clover = img.crop((0, 0, W, int(H * 0.60)))

# 2) Make the white background transparent with a flood fill from the edges.
#    Interior white hearts are enclosed by the dark frame, so they're not
#    reached by the fill and stay opaque.
rgb = clover.convert("RGB")
SENTINEL = (255, 0, 255)
seeds = []
cw, ch = clover.size
for x in (0, cw // 2, cw - 1):
    seeds.append((x, 0))
    seeds.append((x, ch - 1))
for y in (0, ch // 2, ch - 1):
    seeds.append((0, y))
    seeds.append((cw - 1, y))

for seed in seeds:
    ImageDraw.floodfill(rgb, seed, SENTINEL, thresh=60)

# 3) Apply: wherever we painted the sentinel, set alpha to 0.
px_rgb = rgb.load()
px_out = clover.load()
for y in range(ch):
    for x in range(cw):
        if px_rgb[x, y] == SENTINEL:
            r, g, b, _ = px_out[x, y]
            px_out[x, y] = (r, g, b, 0)

# 4) Trim to the clover's bounding box, then add a little breathing room.
bbox = clover.getbbox()
clover = clover.crop(bbox)
pad = int(max(clover.size) * 0.06)
canvas = Image.new("RGBA", (clover.size[0] + pad * 2, clover.size[1] + pad * 2), (0, 0, 0, 0))
canvas.paste(clover, (pad, pad), clover)

canvas.save(OUT)
print(f"Saved {OUT} at {canvas.size}")
