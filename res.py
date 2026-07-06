#!/usr/bin/env python3
"""
Reads the REAL pixel dimensions of each high-res photo and patches
index.html so data-res, width, and height are never typed by hand again.

Usage:
    pip install pillow --break-system-packages   # one-time
    python3 update_image_dims.py

Run this from inside your photography/ folder — the same folder that
contains this specific index.html (not the site root). It expects
assets/ to be one level up, matching the ../assets/... paths already
used in your img src attributes. If your layout differs, adjust the
two paths below.
"""
import re
from pathlib import Path
from PIL import Image



HTML_PATH = Path("photography/index.html")
HIGH_RES_DIR = Path("assets/high_res")

def high_res_path(low_res_filename: str) -> Path:
    """Mirrors the site's own convention: same name, .jpg, in high_res/."""
    stem = Path(low_res_filename).stem
    return HIGH_RES_DIR / f"{stem}.jpg"

def main():
    html = HTML_PATH.read_text(encoding="utf-8")

    # Match each <figure> block, capturing its low_res filename and the img tag
    fig_pattern = re.compile(
        r'(<figure class="gitem"[^>]*data-res=")([^"]*)("[^>]*>'
        r'<div class="gi-wrap"><img src="\.\./assets/low_res/([^"]+)"'
        r'(?:\s+width="\d+"\s+height="\d+")?)'
    )

    updated, missing = 0, []

    def replace(m):
        nonlocal updated
        prefix, _old_res, mid, filename = m.groups()
        img_path = high_res_path(filename)
        if not img_path.exists():
            missing.append(filename)
            return m.group(0)  # leave untouched
        with Image.open(img_path) as im:
            w, h = im.size
        updated += 1
        return f'{prefix}{w}×{h}{mid} width="{w}" height="{h}"'

    html = fig_pattern.sub(replace, html)
    HTML_PATH.write_text(html, encoding="utf-8")

    print(f"Updated {updated} figures.")
    if missing:
        print(f"Skipped {len(missing)} (high-res file not found):")
        for f in missing:
            print(f"  - {f}")

if __name__ == "__main__":
    main()