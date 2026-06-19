#!/usr/bin/env python3
"""Generate PWA / iOS home-screen icons with no third-party deps.

Draws a full-bleed dark-green background (maskable-safe) with a gold "F"
monogram (the letter is composed of rectangles, so no font rendering needed).
Outputs PNGs at the sizes iOS + Android PWAs need.
"""
import struct, zlib, os

GREEN = (47, 95, 224)     # #2f5fe0  (CFP Study Home brand blue)
GOLD  = (217, 138, 31)    # #d98a1f
CREAM = (244, 246, 251)   # #f6f7fb

OUT = os.path.join(os.path.dirname(__file__), "..", "icons")
os.makedirs(OUT, exist_ok=True)


def make_icon(n, bg, fg, accent):
    # RGBA buffer
    buf = bytearray()
    # precompute F geometry
    cx, cy = n / 2, n / 2
    H = n * 0.46
    W = n * 0.34
    t = n * 0.105
    x0 = cx - W / 2
    y0 = cy - H / 2
    # vertical bar
    vx0, vx1 = x0, x0 + t
    vy0, vy1 = y0, y0 + H
    # top bar
    tx0, tx1 = x0, x0 + W
    ty0, ty1 = y0, y0 + t
    # middle bar
    mx0, mx1 = x0, x0 + W * 0.80
    my0, my1 = y0 + H * 0.42, y0 + H * 0.42 + t
    # subtle accent dot (seal flourish) top-right of monogram area
    r = n * 0.052
    ax, ay = cx + W * 0.42, y0 - n * 0.02

    def in_f(x, y):
        if vx0 <= x < vx1 and vy0 <= y < vy1:  # vertical
            return True
        if tx0 <= x < tx1 and ty0 <= y < ty1:  # top
            return True
        if mx0 <= x < mx1 and my0 <= y < my1:  # middle
            return True
        return False

    for y in range(n):
        buf.append(0)  # filter type 0 per scanline
        for x in range(n):
            px = bg
            # rounded corners (mask) — keep mostly full-bleed for maskable
            # accent dot
            if (x - ax) ** 2 + (y - ay) ** 2 <= r * r:
                px = accent
            elif in_f(x + 0.5, y + 0.5):
                px = fg
            buf.extend((px[0], px[1], px[2], 255))

    raw = bytes(buf)

    def chunk(typ, data):
        c = struct.pack(">I", len(data)) + typ + data
        return c + struct.pack(">I", zlib.crc32(typ + data) & 0xffffffff)

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", n, n, 8, 6, 0, 0, 0)  # 8-bit RGBA
    idat = zlib.compress(raw, 9)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")


targets = {
    "icon-192.png": 192,
    "icon-512.png": 512,
    "apple-touch-icon.png": 180,
    "icon-maskable-512.png": 512,
    "favicon-32.png": 32,
}

for name, size in targets.items():
    data = make_icon(size, GREEN, CREAM, GOLD)
    with open(os.path.join(OUT, name), "wb") as f:
        f.write(data)
    print(f"wrote {name} ({size}x{size}, {len(data)} bytes)")
