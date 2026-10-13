#!/usr/bin/env python3
"""Validate and resolve graphics theme without changing captions or source audio."""
import json
import os
from pathlib import Path
import re

PRESETS = {"legacy-lime", "dark-tech", "light-minimal", "warm-story", "henry-brand"}
THEMED_KINDS = {"flow_diagram", "concept_build", "progress_steps", "vs_split", "callout",
                "keyword_chips", "annotated_screenshot", "speaker_canvas", "object_transform"}
FIELDS = {"preset", "backgroundStyle", "accent", "background", "fontFamily", "cardStyle", "motion"}


def validate_theme(config):
    if isinstance(config, str):
        config = {"preset": config}
    if not isinstance(config, dict):
        raise ValueError("graphics_theme must be a preset name or an object")
    extra = set(config) - FIELDS
    if extra:
        raise ValueError(f"Unknown graphics_theme fields: {sorted(extra)}")
    result = {"preset": "legacy-lime", **config}
    if result["preset"] not in PRESETS:
        raise ValueError(f"Unknown graphics preset: {result['preset']}")
    for key, allowed in {"backgroundStyle": {"solid", "gradient", "grid"},
                         "cardStyle": {"rounded", "square", "pill"},
                         "motion": {"gentle", "balanced", "energetic"}}.items():
        if key in result and result[key] not in allowed:
            raise ValueError(f"Invalid graphics {key}: {result[key]}")
    for key in ("accent", "background"):
        if key in result and not (isinstance(result[key], str) and re.fullmatch(r"#[0-9a-fA-F]{6}", result[key])):
            raise ValueError(f"{key} must be a six-digit hex color")
    if "fontFamily" in result and not (isinstance(result["fontFamily"], str) and result["fontFamily"].strip()):
        raise ValueError("fontFamily must be a non-empty CSS font-family string")
    return result


def load_graphics_theme(plan_dir, workdir):
    """Explicit config file > explicit preset env > this source's saved options > legacy."""
    custom = os.environ.get("VIDEO_EDIT_GRAPHICS_CONFIG")
    if custom:
        return validate_theme(json.loads(Path(custom).read_text()))
    preset = os.environ.get("VIDEO_EDIT_GRAPHICS_THEME")
    if preset:
        return validate_theme(preset)
    for folder in dict.fromkeys([Path(plan_dir), Path(workdir)]):
        options = folder / "edit_options.json"
        if options.is_file():
            data = json.loads(options.read_text())
            if "graphics_theme" in data:
                return validate_theme(data["graphics_theme"])
    return validate_theme("legacy-lime")
