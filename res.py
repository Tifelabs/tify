#!/usr/bin/env python3
"""
Reads REAL dimensions from high-res JPGs and updates index.html
Low-res: .webp → High-res: .jpg
"""

import re
from pathlib import Path
from PIL import Image

# Adjust these paths to match your project structure
HTML_PATH = Path("photography/index.html")
HIGH_RES_DIR = Path("assets/high_res")

def get_high_res_path(low_res_name: str) -> Path:
    """low_res/anything.webp → high_res/anything.jpg"""
    stem = Path(low_res_name).stem
    return HIGH_RES_DIR / f"{stem}.jpg"

def main():
    if not HTML_PATH.exists():
        print(f"❌ HTML file not found: {HTML_PATH}")
        print("Make sure you're running this from the root of your site repo.")
        return

    html = HTML_PATH.read_text(encoding="utf-8")

    # Regex to find each photo figure
    pattern = re.compile(
        r'(<figure class="gitem"[^>]*data-res=")([^"]*)("[^>]*>.*?<img src="\.\./assets/low_res/([^"]+?)"[^>]*?>)',
        re.DOTALL
    )

    updated = 0
    missing = []

    def update_match(match):
        nonlocal updated
        prefix, current_res, middle, low_res_filename = match.groups()

        high_res_file = get_high_res_path(low_res_filename)

        if not high_res_file.exists():
            missing.append(low_res_filename)
            return match.group(0)

        try:
            with Image.open(high_res_file) as img:
                width, height = img.size

            new_res = f"{width}×{height}"

            # Add width/height attributes to <img> tag
            if 'width="' not in middle:
                img_tag_end = middle.rfind(">")
                if img_tag_end != -1:
                    middle = middle[:img_tag_end] + f' width="{width}" height="{height}"' + middle[img_tag_end:]

            nonlocal updated
            updated += 1
            return f"{prefix}{new_res}{middle}"

        except Exception as e:
            missing.append(f"{low_res_filename} (error: {e})")
            return match.group(0)

    # Apply updates
    new_html = pattern.sub(update_match, html)

    # Save changes
    HTML_PATH.write_text(new_html, encoding="utf-8")

    # Results
    print(f"✅ Updated {updated} images with real dimensions.")
    
    if missing:
        print(f"⚠️  {len(missing)} high-res files not found:")
        for item in missing[:10]:
            print(f"   • {item}")
        if len(missing) > 10:
            print(f"   ... and {len(missing) - 10} more.")

if __name__ == "__main__":
    main()