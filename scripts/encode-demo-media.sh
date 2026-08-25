#!/usr/bin/env bash
# Encode captures from media/ into public/demo/ for the landing.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MEDIA="$ROOT/media"
OUT="$ROOT/public/demo"
mkdir -p "$OUT"

VIDEO=$(find "$MEDIA" -maxdepth 1 -type f \( -iname '*.mov' -o -iname '*.mp4' \) | head -1)
# Prefer an explicit rating.* file; else the newest Screenshot*.png (larger rating crop)
SHOT=$(find "$MEDIA" -maxdepth 1 -type f \( -iname 'rating.png' -o -iname 'rating.jpg' -o -iname 'rating.webp' \) | head -1)
if [[ -z "${SHOT:-}" ]]; then
  SHOT=$(find "$MEDIA" -maxdepth 1 -type f -iname 'Screenshot*.png' | sort | tail -1)
fi
if [[ -z "${SHOT:-}" ]]; then
  SHOT=$(find "$MEDIA" -maxdepth 1 -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \) | head -1)
fi

if [[ -z "${VIDEO:-}" ]]; then
  echo "No video found in $MEDIA" >&2
  exit 1
fi
if [[ -z "${SHOT:-}" ]]; then
  echo "No screenshot found in $MEDIA" >&2
  exit 1
fi

ffmpeg -y -t 5.0 -i "$VIDEO" \
  -vf "fps=10,scale=560:-1:flags=lanczos" \
  -c:v libvpx-vp9 -b:v 0 -crf 35 -an \
  "$OUT/hourly.webm"

ffmpeg -y -ss 0.5 -i "$VIDEO" -vframes 1 -update 1 \
  -vf "scale=560:-1:flags=lanczos" \
  "$OUT/hourly-poster.jpg"

cp "$SHOT" "$OUT/rating.png"
rm -f "$OUT/hourly.gif" "$OUT/hourly.mp4"

ls -lh "$OUT"
echo "Demo assets ready in public/demo/"
