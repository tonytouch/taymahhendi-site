#!/usr/bin/env bash
# Regenerate the embedded waveform for the player.
#
# The page draws its waveform from a PEAKS array inlined in index.html so
# visitors never download the audio just to render it. Run this after
# swapping assets/zero-to-40.mp3, then paste the output into the PEAKS
# array near the top of the <script> block in index.html.
#
#   ./tools/build-peaks.sh              # uses assets/zero-to-40.mp3
#   ./tools/build-peaks.sh other.mp3    # or any other file
#
# Requires: ffmpeg, python3

set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
track="${1:-$here/assets/zero-to-40.mp3}"
bars="${BARS:-900}"

[ -f "$track" ] || { echo "no such file: $track" >&2; exit 1; }

# Downmix to 8kHz mono PCM — ample resolution for a waveform, and small.
ffmpeg -hide_banner -loglevel error -i "$track" -ac 1 -ar 8000 -f s16le - \
| BARS="$bars" python3 -c '
import sys, os, struct

raw = sys.stdin.buffer.read()
n = len(raw) // 2
if not n:
    sys.exit("no audio decoded")
samples = struct.unpack("<%dh" % n, raw[:n * 2])

bars = int(os.environ["BARS"])
bucket = n // bars
peaks = []
for i in range(bars):
    seg = samples[i * bucket:(i + 1) * bucket]
    peaks.append(max(abs(s) for s in seg) if seg else 0)

mx = max(peaks) or 1
vals = [str(max(2, round(p / mx * 99))) for p in peaks]

print("    var PEAKS = [")
for i in range(0, len(vals), 40):
    line = ",".join(vals[i:i + 40])
    print("      " + line + ("," if i + 40 < len(vals) else ""))
print("    ];")
'
