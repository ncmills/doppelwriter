#!/bin/bash
# Mixes BGM + SFX cues onto the silent marketing film.
# Audio cue layout (per audio-design-rules.md config A "ad" pack):
#   0.5s  · brand-stamp.mp3   · ditto-mark stamps in segment 1
#   4.5s  · type-fast.mp3     · mono headline typing in segment 2
#   6.5s  · dissolve.mp3      · italic completion fade-in
#   10.5s · whoosh.mp3        · 1st portrait drift (Didion)
#   12.0s · whoosh.mp3        · 2nd portrait drift (Hemingway)
#   13.5s · whoosh.mp3        · 3rd portrait drift (PG)
#   15.0s · whoosh.mp3        · 4th portrait drift (Obama)
#   16.5s · whoosh.mp3        · 5th portrait drift (Morrison)
#   19.0s · dissolve.mp3      · anchor segment transition
#   25.5s · brand-stamp.mp3   · close stamp
#
# BGM: bgm-ad.mp3 fades in 0.5s, full volume by 2s, fades out 28s-30s.
# SFX volume normalized to -6dB so BGM stays prominent.

set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
EXPORTS="$REPO/_assets/scenes/exports"
SFX="$HOME/.claude/skills/huashu-design/assets/sfx"
BGM="$HOME/.claude/skills/huashu-design/assets/bgm-ad.mp3"
SILENT="$EXPORTS/marketing-film-silent.mp4"
OUT="$EXPORTS/marketing-film.mp4"

if [ ! -f "$SILENT" ]; then
  echo "Missing $SILENT — run scripts/record-film.js first."
  exit 1
fi

DURATION=30

# Build the ffmpeg input + filter graph.
# Inputs: 0=video, 1=BGM, 2..N=SFX clips
ffmpeg -y \
  -i "$SILENT" \
  -i "$BGM" \
  -i "$SFX/impact/brand-stamp.mp3" \
  -i "$SFX/keyboard/type-fast.mp3" \
  -i "$SFX/transition/dissolve.mp3" \
  -i "$SFX/transition/whoosh.mp3" \
  -i "$SFX/transition/whoosh.mp3" \
  -i "$SFX/transition/whoosh.mp3" \
  -i "$SFX/transition/whoosh.mp3" \
  -i "$SFX/transition/whoosh.mp3" \
  -i "$SFX/transition/dissolve.mp3" \
  -i "$SFX/impact/brand-stamp.mp3" \
  -filter_complex "
    [1:a]volume=0.30,afade=t=in:st=0.5:d=1.5,afade=t=out:st=28:d=2[bgm];
    [2:a]adelay=500|500,volume=0.7[s1];
    [3:a]adelay=4500|4500,volume=0.5[s2];
    [4:a]adelay=6500|6500,volume=0.4[s3];
    [5:a]adelay=10500|10500,volume=0.45[s4];
    [6:a]adelay=12000|12000,volume=0.45[s5];
    [7:a]adelay=13500|13500,volume=0.45[s6];
    [8:a]adelay=15000|15000,volume=0.45[s7];
    [9:a]adelay=16500|16500,volume=0.45[s8];
    [10:a]adelay=19000|19000,volume=0.4[s9];
    [11:a]adelay=25500|25500,volume=0.7[s10];
    [bgm][s1][s2][s3][s4][s5][s6][s7][s8][s9][s10]amix=inputs=11:duration=longest:dropout_transition=0,
    atrim=0:${DURATION},asetpts=PTS-STARTPTS[mix]
  " \
  -map 0:v -map "[mix]" \
  -c:v copy -c:a aac -b:a 192k \
  -shortest \
  "$OUT"

echo "✓ wrote $OUT"

# Verify audio stream landed
if ffprobe -v error -select_streams a -show_entries stream=codec_type "$OUT" | grep -q codec_type; then
  echo "✓ audio stream present"
else
  echo "✗ no audio stream — investigate"
  exit 1
fi
