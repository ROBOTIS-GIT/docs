"""Compose a supersampled two-view alignment guide from native CAD renders."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import sys

source, dest, fonts = map(Path, sys.argv[1:4])
dest.mkdir(parents=True, exist_ok=True)
S = 3
W, H = 2400, 1480
BG, INK, MUTED, ACCENT = "#f5f6f8", "#202930", "#65717a", "#087f94"
canvas = Image.new("RGB", (W * S, H * S), BG)
d = ImageDraw.Draw(canvas)


def text(x, y, value, size=30, bold=False, color=INK):
    font = ImageFont.truetype(
        str(fonts / ("Inter-SemiBold.ttf" if bold else "Inter-Regular.ttf")), size * S
    )
    d.text((x * S, y * S), value, font=font, fill=color)


def rule(x1, y1, x2, y2, color="#dce1e5", width=1):
    d.line((x1 * S, y1 * S, x2 * S, y2 * S), fill=color, width=width * S)


def picture(path, box, crop=None, trim=False):
    im = Image.open(path).convert("RGBA")
    if crop:
        im = im.crop(crop)
    if trim:
        im = im.crop(im.getbbox())
    x, y, w, h = box
    scale = min(w * S / im.width, h * S / im.height)
    im = im.resize(
        (round(im.width * scale), round(im.height * scale)), Image.Resampling.LANCZOS
    )
    canvas.paste(
        im,
        (int((x + w / 2) * S - im.width / 2), int((y + h / 2) * S - im.height / 2)),
        im,
    )


a = 80
text(a, 55, "Check the horn orientation", 52, True)
text(a, 133, "Both models use one upper mark and two lower marks.", 30, color=MUTED)
rule(80, 215, 2320, 215)
for kind, title, x in [("leader", "XL330", 80), ("follower", "XL430", 1280)]:
    text(x, 255, title, 46, True)
    text(x, 326, "REFERENCE POSE", 21, True, MUTED)
    picture(source / f"{kind}-horn.png", (x - 10, 405, 490, 825), trim=True)
    dx = x + 540
    text(dx, 350, "01", 25, True, ACCENT)
    text(dx + 58, 347, "Single mark", 32, True)
    picture(
        source / f"{kind}-detail.png", (dx, 411, 500, 320), crop=(245, 270, 945, 718)
    )
    text(dx, 757, "Align the horn and housing marks.", 24, color=MUTED)
    rule(dx, 817, dx + 500, 817)
    text(dx, 872, "02", 25, True, ACCENT)
    text(dx + 58, 869, "Double mark", 32, True)
    picture(source / f"{kind}-bottom.png", (dx, 933, 500, 292))
    text(dx, 1251, "Check the opposite side of the horn.", 24, color=MUTED)
rule(80, 1350, 2320, 1350)
text(80, 1390, "Check alignment before attaching the frame.", 26, color=MUTED)
canvas.resize((W, H), Image.Resampling.LANCZOS).save(
    dest / "horn-alignment.webp", quality=94, method=6
)
for kind, name in [("follower", "bic30"), ("follower-xl4015", "xl4015")]:
    Image.open(source / f"{kind}-board.png").save(
        dest / f"converter-{name}.webp", quality=90, method=6
    )
print(dest / "horn-alignment.webp")
