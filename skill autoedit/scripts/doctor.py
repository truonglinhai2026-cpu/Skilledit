#!/usr/bin/env python3
"""Read-only runtime check for video editing in Codex."""
from __future__ import annotations
import argparse
import json
import os
import shutil
import subprocess
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    checks = {name: shutil.which(name) for name in ["ffmpeg", "ffprobe", "node", "npm"]}
    python = Path(os.environ.get("VIDEO_EDIT_PYTHON", str(root / ".venv/bin/python")))
    checks["python"] = str(python) if python.is_file() else None
    browser = Path(os.environ.get("VIDEO_EDIT_BROWSER", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"))
    checks["chrome"] = str(browser) if browser.is_file() else None
    python_packages = {}
    if checks["python"]:
        code = "import importlib.util,json;print(json.dumps({n:importlib.util.find_spec(n) is not None for n in ['whisper','whisperx','torch','PIL','rembg']}))"
        result = subprocess.run([str(python), "-c", code], capture_output=True, text=True)
        if result.returncode == 0:
            python_packages = json.loads(result.stdout)
    node_info = {}
    if checks["node"]:
        code = "console.log(JSON.stringify({platform:process.platform,arch:process.arch,remotion:require('./node_modules/remotion/package.json').version,renderer:!!require('@remotion/renderer')}))"
        result = subprocess.run([checks["node"], "-e", code], cwd=root / "remotion", capture_output=True, text=True)
        if result.returncode == 0:
            node_info = json.loads(result.stdout)
            native = root / "remotion/node_modules/@remotion" / f"compositor-{node_info['platform']}-{node_info['arch']}"
            node_info["native_compositor"] = native.is_dir()
    ready = all(checks.values()) and python_packages.get("torch") and python_packages.get("PIL") and (
        python_packages.get("whisper") or python_packages.get("whisperx")) and node_info.get("native_compositor")
    report = {"ready": bool(ready), "tools": checks, "python_packages": python_packages,
              "node_runtime": node_info, "follow_camera_available": bool(python_packages.get("rembg"))}
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print("[doctor] READY" if ready else "[doctor] MISSING dependencies; run setup.sh or choose an existing runtime.")
        print("[doctor] Local ASR:", "Whisper" if python_packages.get("whisper") else "WhisperX" if python_packages.get("whisperx") else "missing")
        print("[doctor] Remotion:", node_info.get("remotion", "missing"), "; native compositor:", node_info.get("native_compositor", False))
        if not python_packages.get("rembg"):
            print("[doctor] Optional follow camera unavailable; source framing remains usable.")
    return 0 if ready else 1


if __name__ == "__main__":
    raise SystemExit(main())
