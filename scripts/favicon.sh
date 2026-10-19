#!/bin/sh
# Renders the raster icons into the repository root:
#
#   favicon.ico, favicon-48x48.png, favicon-96x96.png  from scripts/favicon.svg
#   apple-touch-icon.png                                from scripts/apple-touch-icon.svg
#
# Browser tabs use /favicon.svg. Google Search does not take SVG favicons and
# shows them in a circle, so its icons use scripts/favicon.svg: the same logo
# on a full white square, with the shards scaled to 72 % so their rounded
# corners stay inside the circle. iOS masks the touch icon to a rounded
# square, which cuts less, so scripts/apple-touch-icon.svg scales them to 84 %.
#
#   scripts/favicon.sh
#
# Needs Google Chrome, sips (macOS) and python3.
set -eu

chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# render <source svg> <name>: a 1024 px PNG of the 512 px SVG at $tmp/<name>.png
render() {
  "$chrome" --headless=new --hide-scrollbars --allow-file-access-from-files \
    --window-size=512,512 --force-device-scale-factor=2 \
    --screenshot="$tmp/$2.png" "file://$PWD/$1" 2>/dev/null
}

render scripts/favicon.svg favicon
render scripts/apple-touch-icon.svg apple

for size in 16 32 48 96; do
  sips -s format png -z "$size" "$size" "$tmp/favicon.png" --out "$tmp/$size.png" >/dev/null
done
cp "$tmp/48.png" favicon-48x48.png
cp "$tmp/96.png" favicon-96x96.png
sips -s format png -z 180 180 "$tmp/apple.png" --out apple-touch-icon.png >/dev/null

# An ICO file is a directory of images; each entry here holds a PNG.
python3 - "$tmp" <<'EOF'
import struct, sys
sizes = (16, 32, 48)
images = [open(f"{sys.argv[1]}/{size}.png", "rb").read() for size in sizes]
offset = 6 + 16 * len(images)
entries = b""
for size, image in zip(sizes, images):
    entries += struct.pack("<BBBBHHII", size, size, 0, 0, 1, 32, len(image), offset)
    offset += len(image)
with open("favicon.ico", "wb") as ico:
    ico.write(struct.pack("<HHH", 0, 1, len(images)) + entries + b"".join(images))
EOF

echo favicon.ico
echo favicon-48x48.png
echo favicon-96x96.png
echo apple-touch-icon.png
