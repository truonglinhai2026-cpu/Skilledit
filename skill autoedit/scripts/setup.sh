#!/usr/bin/env bash
# Reuse existing dependencies; install only missing components.
set -euo pipefail
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REMOTION_DIR="$SKILL_DIR/remotion"
for tool in ffmpeg ffprobe python3 node npm; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "[setup] Thiếu $tool. Cài runtime phù hợp máy rồi chạy lại doctor.py."
    exit 1
  fi
done
VENV_PY="${VIDEO_EDIT_PYTHON:-$SKILL_DIR/.venv/bin/python}"
if [ ! -x "$VENV_PY" ]; then
  python3 -m venv "$SKILL_DIR/.venv"
  VENV_PY="$SKILL_DIR/.venv/bin/python"
fi
if ! "$VENV_PY" -c 'import whisper, torch' >/dev/null 2>&1 \
  && ! "$VENV_PY" -c 'import whisperx, torch' >/dev/null 2>&1; then
  "$VENV_PY" -m pip install openai-whisper
fi
if ! "$VENV_PY" -c 'import PIL' >/dev/null 2>&1; then
  "$VENV_PY" -m pip install Pillow
fi
if ! (cd "$REMOTION_DIR" && node -e 'require("@remotion/renderer"); require("remotion")') >/dev/null 2>&1; then
  (cd "$REMOTION_DIR" && npm install --include=optional)
fi
mkdir -p "$REMOTION_DIR/public"
python3 "$SKILL_DIR/scripts/doctor.py"
