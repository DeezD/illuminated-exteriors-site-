#!/usr/bin/env bash
# Stitches the Higgsfield segments into one scroll film and prints the numbers
# the ScrollVideoHero needs (Intro to, Copy lights at, each chapter's "Starts at").
#
#   bash make-film.sh <out.mp4> <hold-seconds> <ignition.mp4> <season1.mp4> [season2.mp4 ...]
#   e.g. bash make-film.sh film-16x9.mp4 1.5 V1.mp4 V2-halloween.mp4 V3-christmas.mp4 V4-red.mp4 V5-blue.mp4
#
# Each segment is normalized to 24 fps and 1920px wide, and its last frame is held
# for <hold-seconds> so every lit scene rests on screen while its text is read.
# Then: bash make-frames.sh hero <out.mp4> [9:16 film]   (set DESKTOP_FRAMES to ~10 per second of film)

set -euo pipefail

out="${1:?output file}"
hold="${2:?hold seconds}"
shift 2
[ "$#" -ge 2 ] || { echo "need the ignition segment and at least one season segment"; exit 1; }

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
durs=()
i=0
for seg in "$@"; do
    d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$seg")
    durs+=("$d")
    ffmpeg -loglevel error -y -i "$seg" -an \
        -vf "fps=24,scale=1920:-2:flags=lanczos,format=yuv420p,tpad=stop_mode=clone:stop_duration=${hold}" \
        -c:v libx264 -crf 16 -preset slow "$tmp/$(printf %02d $i).mp4"
    echo "file '$tmp/$(printf %02d $i).mp4'" >> "$tmp/list.txt"
    i=$((i + 1))
done
ffmpeg -loglevel error -y -f concat -safe 0 -i "$tmp/list.txt" -c copy "$out"

python3 - "$hold" "${durs[@]}" <<'EOF'
import sys
hold = float(sys.argv[1]); d = [float(x) for x in sys.argv[2:]]
total = sum(x + hold for x in d)
print(f"film: {total:.1f}s  ->  about {round(total * 10)} frames at 10 per second")
print(f"Intro to:        {d[0] * 0.9 / total:.3f}")
print(f"Copy lights at:  {d[0] * 0.7 / total:.3f}")
t = d[0] + hold
for n, x in enumerate(d[1:], 1):
    print(f"Chapter {n} starts at: {(t + x * 0.5) / total:.3f}")
    t += x + hold
EOF
