#!/usr/bin/env bash
# Turns the Higgsfield renders into web-ready assets for the Framer components.
#
#   bash make-frames.sh hero  <hero-16x9.mp4> [hero-9x16.mp4]
#       -> out/hero/16x9/0001.webp ... (180 frames, 1600px wide)
#       -> out/hero/9x16/0001.webp ... (120 frames, 720px wide)
#       -> out/hero/poster-16x9.webp, lit-16x9.webp (first and last frame), same for 9x16
#   bash make-frames.sh loop  <scene.mp4> <name>
#       -> out/loops/<name>.mp4 (H.264, no audio, 1280px, fast start) and <name>.webp still
#   bash make-frames.sh still <image> <name>
#       -> out/stills/<name>-2400.webp and <name>-1200.webp
#
# Needs ffmpeg and ffprobe. Upload out/hero/* to a CDN folder (Cloudflare R2,
# Bunny, S3 + CloudFront) and paste the folder URL with {n}.webp into the
# ScrollVideoHero "Frames" property. Loops and stills go into Framer directly.

set -euo pipefail

DESKTOP_FRAMES="${DESKTOP_FRAMES:-180}"
MOBILE_FRAMES="${MOBILE_FRAMES:-120}"
OUT="${OUT:-out}"

duration() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }

sequence() { # <src> <dir> <count> <width> <quality>
    local src="$1" dir="$2" count="$3" width="$4" q="$5"
    local fps
    fps=$(awk -v n="$count" -v d="$(duration "$src")" 'BEGIN { printf "%.5f", n / d }')
    mkdir -p "$dir"
    rm -f "$dir"/*.webp
    ffmpeg -loglevel error -y -i "$src" \
        -vf "fps=${fps},scale=${width}:-2:flags=lanczos" \
        -frames:v "$count" -c:v libwebp -quality "$q" -compression_level 6 "$dir/%04d.webp"
    local first last
    first=$(ls "$dir"/*.webp | head -1)
    last=$(ls "$dir"/*.webp | tail -1)
    echo "$dir: $(ls "$dir"/*.webp | wc -l) frames, $(du -sh "$dir" | cut -f1)"
    echo "$first|$last"
}

case "${1:-}" in
hero)
    src16="${2:?hero 16:9 video required}"
    res=$(sequence "$src16" "$OUT/hero/16x9" "$DESKTOP_FRAMES" 1600 66 | tee /dev/stderr | tail -1)
    cp "${res%%|*}" "$OUT/hero/poster-16x9.webp"
    cp "${res##*|}" "$OUT/hero/lit-16x9.webp"
    if [ -n "${3:-}" ]; then
        res=$(sequence "$3" "$OUT/hero/9x16" "$MOBILE_FRAMES" 720 62 | tee /dev/stderr | tail -1)
        cp "${res%%|*}" "$OUT/hero/poster-9x16.webp"
        cp "${res##*|}" "$OUT/hero/lit-9x16.webp"
    fi
    ;;
loop)
    src="${2:?scene video required}"
    name="${3:?name required}"
    mkdir -p "$OUT/loops"
    ffmpeg -loglevel error -y -i "$src" -an -vf "scale=1280:-2:flags=lanczos,format=yuv420p" \
        -c:v libx264 -profile:v high -crf 24 -preset slow -movflags +faststart "$OUT/loops/$name.mp4"
    ffmpeg -loglevel error -y -i "$src" -vf "scale=1600:-2" -frames:v 1 -c:v libwebp -quality 72 "$OUT/loops/$name.webp"
    echo "$OUT/loops/$name.mp4: $(du -h "$OUT/loops/$name.mp4" | cut -f1)"
    ;;
still)
    src="${2:?image required}"
    name="${3:?name required}"
    mkdir -p "$OUT/stills"
    for w in 2400 1200; do
        ffmpeg -loglevel error -y -i "$src" -vf "scale='min($w,iw)':-2:flags=lanczos" -c:v libwebp -quality 76 \
            "$OUT/stills/$name-$w.webp"
    done
    echo "$OUT/stills/$name-*.webp"
    ;;
*)
    sed -n '2,15p' "$0"
    exit 1
    ;;
esac
