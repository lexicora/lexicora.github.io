#!/bin/sh
# Cuts the homepage's product shots out of the store screenshots and encodes
# each at the widths the page asks for, as JPEG XL, AVIF and JPEG.
#
# The store screenshots (lexicora-extension/docs/store/screenshots) carry a
# headline of their own. The homepage has its own headings, so it shows only
# the browser window (1, 2) or the side panel (3 to 5) from them.
#
#   scripts/product-shots.sh [path/to/lexicora-extension]
#
# Needs sips (macOS), cjxl (brew install jpeg-xl) and avifenc
# (brew install libavif).
set -eu

ext=${1:-../lexicora-extension}
src="$ext/docs/store/screenshots"
out=assets/img/product
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$out"

# name  screenshot  x  y  width  height  widths to encode
# The boxes are in the 2400 x 1800 originals. Windows are cut at their edge,
# where the page's rounded corners take over; panels keep a little margin
# and stop below the last whole item.
while read -r name shot x y w h widths; do
  sips --cropOffset "$y" "$x" -c "$h" "$w" "$src/$shot.png" --out "$tmp/$name.png" >/dev/null
  for width in $widths; do
    base="$out/$name-$width"
    sips -s format png --resampleWidth "$width" "$tmp/$name.png" --out "$tmp/$name-$width.png" >/dev/null
    sips -s format jpeg -s formatOptions 82 "$tmp/$name-$width.png" --out "$base.jpg" >/dev/null
    cjxl "$tmp/$name-$width.png" "$base.jxl" -d 1.0 -e 7 --quiet
    avifenc -q 62 -s 4 -y 444 "$tmp/$name-$width.png" "$base.avif" >/dev/null
    echo "$base"
  done
done <<'EOF'
capture 1   37 302 2326 1460  800 1600 2320
editor  2   35 301 2329 1461  800 1600 2320
library 3 1318   0 1072 1450  536 1072
search  4 1318   0 1072 1240  536 1072
export  5 1318   0 1072  880  536 1072
EOF
