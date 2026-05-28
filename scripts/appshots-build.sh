#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

RAW=play-assets-v2/raw/android-phone-tall/portrait
OUT=play-assets-v2/framed
BG="linear-gradient(160deg, #10b981, #0d9488)"
DEVICE=android-phone-tall

mkdir -p "$OUT"
rm -f "$OUT"/*.png

frame() {
  local src="$1" title="$2" subtitle="$3" out="$4"
  appshots frame "$src" \
    -c appshots.config.mjs \
    -d "$DEVICE" \
    -o "$OUT" \
    -t "$title" \
    -s "$subtitle" \
    --text-position top \
    --padding 0.09
  local generated="$OUT/$(basename "$src" .png)-${DEVICE}.png"
  mv "$generated" "$OUT/$out"
}

frame "$RAW/01-screen-1.png" "Land records, one tap" "Village maps · RTC · survey docs" "01-home.png"
frame "$RAW/02-screen-2.png" "Find any village"      "District → Taluk → Hobli → Village" "02-search.png"
frame "$RAW/03-screen-3.png" "Browse on the map"     "Tap a district to drill in"         "03-map.png"

echo ""
echo "Done. Output:"
ls -la "$OUT"
