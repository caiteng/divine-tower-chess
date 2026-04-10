import math
import os
import struct
import zlib


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "assets", "resources", "textures")


def clamp(value):
    return max(0, min(255, int(value)))


def mix(a, b, t):
    return tuple(clamp(a[i] * (1 - t) + b[i] * t) for i in range(4))


def write_png(path, width, height, pixel_fn):
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        for x in range(width):
            raw.extend(pixel_fn(x, y, width, height))

    def chunk(kind, data):
        body = kind + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)

    png = bytearray()
    png.extend(b"\x89PNG\r\n\x1a\n")
    png.extend(chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)))
    png.extend(chunk(b"IDAT", zlib.compress(bytes(raw), 9)))
    png.extend(chunk(b"IEND", b""))

    with open(path, "wb") as f:
        f.write(png)


def board_pixel(x, y, w, h):
    top = (52, 76, 94, 255)
    bottom = (123, 151, 159, 255)
    color = mix(top, bottom, y / max(1, h - 1))

    lane_centers = (82, 178)
    for lane_y in lane_centers:
        if abs(y - lane_y) < 14 and 35 < x < w - 70:
            color = mix(color, (170, 188, 184, 255), 0.75)

    # Subtle stone tile seams.
    if x % 72 in (0, 1) or y % 52 in (0, 1):
        color = mix(color, (27, 38, 48, 255), 0.22)

    # Divine glow around the crystal side.
    dx = x - (w - 55)
    dy = y - h / 2
    glow = max(0, 1 - math.sqrt(dx * dx + dy * dy) / 180)
    if glow > 0:
        color = mix(color, (92, 213, 255, 255), glow * 0.35)

    return color


def tile_pixel(x, y, w, h):
    cx = x - w / 2
    cy = y - h / 2
    dist = max(abs(cx), abs(cy))
    color = (80, 101, 111, 220)
    if dist < 27:
        color = (158, 178, 174, 230)
    if dist > 28:
        color = (34, 50, 60, 240)
    if abs(cx) < 2 or abs(cy) < 2:
        color = mix(color, (110, 231, 183, 255), 0.45)
    if abs(abs(cx) - abs(cy)) < 1.2 and dist < 24:
        color = mix(color, (210, 246, 235, 255), 0.35)
    return color


def unit_pixel(x, y, w, h):
    cx = x - w / 2
    cy = y - h / 2
    r = math.sqrt(cx * cx + cy * cy)
    if r > 55:
        return (0, 0, 0, 0)
    color = mix((245, 247, 238, 255), (87, 120, 161, 255), min(1, r / 60))
    if r > 48:
        color = (29, 63, 107, 255)
    # Helmet crest.
    if -10 < cx < 10 and -50 < cy < -12:
        color = (230, 183, 70, 255)
    # Face plate.
    if -28 < cx < 28 and -10 < cy < 22:
        color = (234, 239, 230, 255)
    # Eyes.
    if (-18 < cx < -8 or 8 < cx < 18) and 0 < cy < 8:
        color = (28, 40, 53, 255)
    # Shield/body.
    if abs(cx) + max(0, cy - 20) < 42 and cy > 15:
        color = (64, 99, 151, 255)
    return color


def enemy_pixel(x, y, w, h):
    cx = x - w / 2
    cy = y - h / 2
    r = math.sqrt(cx * cx + cy * cy)
    if r > 29:
        return (0, 0, 0, 0)
    color = mix((126, 42, 30, 255), (221, 91, 45, 255), max(0, 1 - r / 30))
    if (-13 < cx < -5 or 5 < cx < 13) and -8 < cy < 0:
        color = (255, 238, 166, 255)
    if abs(cx) < 18 and 10 < cy < 15:
        color = (67, 24, 24, 255)
    return color


def crystal_pixel(x, y, w, h):
    cx = x - w / 2
    cy = y - h / 2
    shape = abs(cx) / 45 + abs(cy) / 110
    if shape > 1:
        return (0, 0, 0, 0)
    color = mix((45, 122, 210, 255), (132, 237, 255, 255), max(0, 1 - shape))
    if abs(cx + cy * 0.15) < 6:
        color = mix(color, (240, 253, 255, 255), 0.55)
    if shape > 0.86:
        color = (18, 86, 150, 255)
    return color


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    write_png(os.path.join(OUT_DIR, "board.png"), 720, 260, board_pixel)
    write_png(os.path.join(OUT_DIR, "tile.png"), 64, 64, tile_pixel)
    write_png(os.path.join(OUT_DIR, "unit.png"), 128, 128, unit_pixel)
    write_png(os.path.join(OUT_DIR, "enemy.png"), 64, 64, enemy_pixel)
    write_png(os.path.join(OUT_DIR, "crystal.png"), 128, 256, crystal_pixel)
    print(f"Generated textures in {OUT_DIR}")


if __name__ == "__main__":
    main()
