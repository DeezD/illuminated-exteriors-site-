#!/usr/bin/env python3
"""Bundle a folder of scroll-film frames into a few "frame pack" files that can be
uploaded to Framer (or any host) and read by ScrollVideoHero.

    python3 make-packs.py <frames-dir> <out-dir> <name> [packs=4]
    e.g. python3 make-packs.py out/hero/16x9 packs hero-16x9 4

Frames are taken in name order (0001.webp, 0002.webp, ...). Pack 1 holds every 8th
frame plus the last, so the whole film can be scrubbed as soon as it arrives; the
remaining frames are split into equal runs across the other packs. The layout rule
is the one ScrollVideoHero uses (packLayout in frameSequence.tsx), so the packs
must be listed in the component in the same order as their file names.

File format (little-endian): b"IEFP" | uint32 header length | header JSON
{"v":1,"type":"image/webp","count":N,"frames":[[index, offset, length], ...]} |
frame bytes (offsets are relative to the end of the header).
"""

import json
import pathlib
import struct
import sys


def layout(count: int, packs: int) -> list[list[int]]:
    coarse = [i for i in range(count) if i % 8 == 0 or i == count - 1]
    rest = [i for i in range(count) if not (i % 8 == 0 or i == count - 1)]
    runs = packs - 1
    size = -(-len(rest) // runs) if runs else 0
    return [coarse] + [rest[k * size : (k + 1) * size] for k in range(runs)]


def main() -> None:
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    src, out, name = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]), sys.argv[3]
    packs = int(sys.argv[4]) if len(sys.argv) > 4 else 4
    frames = sorted(p for p in src.iterdir() if p.suffix.lower() == ".webp")
    if len(frames) < 2:
        sys.exit(f"no .webp frames in {src}")
    out.mkdir(parents=True, exist_ok=True)
    for k, indices in enumerate(layout(len(frames), packs), 1):
        entries, blobs, offset = [], [], 0
        for i in indices:
            data = frames[i].read_bytes()
            entries.append([i, offset, len(data)])
            blobs.append(data)
            offset += len(data)
        header = json.dumps({"v": 1, "type": "image/webp", "count": len(frames), "frames": entries}).encode()
        path = out / f"{name}-{k}-of-{packs}.bin"
        with path.open("wb") as f:
            f.write(b"IEFP" + struct.pack("<I", len(header)) + header)
            for b in blobs:
                f.write(b)
        print(f"{path.name}: {len(indices)} frames, {path.stat().st_size / 1e6:.1f} MB")
    print(f"Count for the component: {len(frames)}")


if __name__ == "__main__":
    main()
