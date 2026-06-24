#!/usr/bin/env python3
"""Generate PWA / iOS home-screen icons with no third-party deps.

Draws a full-bleed brand-blue background (maskable-safe) with a cream "CFP"
wordmark built from clean rectangles (C and P bowls approximated with bars),
so no font rendering is needed. Outputs the sizes iOS + Android PWAs need.
"""
import struct, zlib, os

BG    = (208, 97, 58)     # #d0613a  brand terracotta
FG    = (244, 246, 251)   # #f6f7fb  cream

OUT = os.path.join(os.path.dirname(__file__), "..", "icons")
os.makedirs(OUT, exist_ok=True)


def letter_rects(ch, lx, ty, W, H, t):
    """Return list of (x0,y0,x1,y1) rectangles forming a block letter."""
    r = []
    mid = ty + H * 0.44
    if ch == "C":
        r += [(lx, ty, lx + t, ty + H)]            # left bar
        r += [(lx, ty, lx + W, ty + t)]            # top
        r += [(lx, ty + H - t, lx + W, ty + H)]    # bottom
    elif ch == "F":
        r += [(lx, ty, lx + t, ty + H)]            # left bar
        r += [(lx, ty, lx + W, ty + t)]            # top
        r += [(lx, mid, lx + W * 0.82, mid + t)]   # middle
    elif ch == "P":
        r += [(lx, ty, lx + t, ty + H)]            # left bar
        r += [(lx, ty, lx + W, ty + t)]            # top
        r += [(lx, mid, lx + W, mid + t)]          # middle
        r += [(lx + W - t, ty, lx + W, mid + t)]   # right (bowl)
    return r


def make_icon(n, bg, fg):
    H = n * 0.40
    t = H * 0.17
    W = H * 0.62
    gap = H * 0.26
    total = 3 * W + 2 * gap
    x0 = (n - total) / 2.0
    ty = (n - H) / 2.0

    rects = []
    for i, ch in enumerate("CFP"):
        rects += letter_rects(ch, x0 + i * (W + gap), ty, W, H, t)

    def on(x, y):
        for (a, b, c, d) in rects:
            if a <= x < c and b <= y < d:
                return True
        return False

    buf = bytearray()
    for y in range(n):
        buf.append(0)  # PNG filter type 0
        for x in range(n):
            px = fg if on(x + 0.5, y + 0.5) else bg
            buf.extend((px[0], px[1], px[2], 255))
    raw = bytes(buf)

    def chunk(typ, data):
        return struct.pack(">I", len(data)) + typ + data + struct.pack(">I", zlib.crc32(typ + data) & 0xffffffff)

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", n, n, 8, 6, 0, 0, 0)  # 8-bit RGBA
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")


targets = {
    "icon-192.png": 192,
    "icon-512.png": 512,
    "apple-touch-icon.png": 180,
    "icon-maskable-512.png": 512,
    "favicon-32.png": 32,
}

for name, size in targets.items():
    with open(os.path.join(OUT, name), "wb") as f:
        f.write(make_icon(size, BG, FG))
    print(f"wrote {name} ({size}x{size})")
