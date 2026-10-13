#!/usr/bin/env python3
"""Group reviewed speech into readable captions with emphasis inside the same line."""
from __future__ import annotations
import argparse
import json
import re
import unicodedata
from pathlib import Path
from validate_caption_plan import clean, validate


def norm(text: str) -> str:
    return re.sub(r"[^\w]+", " ", unicodedata.normalize("NFC", text).casefold()).strip()


def phrase_ranges(words: list[dict], phrases: list[str]) -> list[tuple[int, int]]:
    normalized = [norm(w["word"]) for w in words]
    result = set()
    for phrase in phrases:
        wanted = norm(phrase).split()
        if not wanted:
            continue
        for start in range(len(words) - len(wanted) + 1):
            if normalized[start:start + len(wanted)] == wanted:
                result.add((start, start + len(wanted)))
    return sorted(result, key=lambda span: (span[0], -span[1]))


def text_width(text: str, font_size: int) -> float:
    try:
        from PIL import ImageFont
        for filename in ["/Users/henryhoang/Library/Fonts/Montserrat[wght].ttf",
                         "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
                         "/usr/share/fonts/truetype/msttcorefonts/Arial_Bold.ttf",
                         "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]:
            if Path(filename).is_file():
                return ImageFont.truetype(filename, font_size).getlength(text)
    except ImportError:
        pass
    return len(text) * font_size * .62


def build(words: list[dict], emphasis: list[str], protected: list[str],
          width: int = 720, max_words: int = 6, mode: str = "inline",
          duration: float | None = None) -> list[dict]:
    accents = phrase_ranges(words, emphasis)
    ranges = phrase_ranges(words, emphasis + protected)
    by_start = {}
    for start, end in ranges:
        by_start[start] = max(end, by_start.get(start, end))
    accent_indices = {i for start, end in accents for i in range(start, end)}
    units, i = [], 0
    while i < len(words):
        end = by_start.get(i, i + 1)
        units.append(list(range(i, end)))
        i = end
    groups, current = [], []
    font_size = round(width * .058)
    for unit in units:
        candidate = current + unit
        measured_width = sum(
            text_width(clean(words[i]["word"]).upper() if i in accent_indices else clean(words[i]["word"]),
                       round(font_size * 1.25) if i in accent_indices else font_size)
            for i in candidate
        ) + max(0, len(candidate) - 1) * round(font_size * .28)
        pause = bool(current and words[unit[0]]["start"] - words[current[-1]]["end"] > .42)
        sentence = bool(current and re.search(r"[.!?]$", words[current[-1]]["word"]))
        long = words[candidate[-1]]["end"] - words[candidate[0]]["start"] > 2.5
        wide = measured_width > width * .84
        if current and (pause or sentence or long or wide or len(candidate) > max_words):
            groups.append(current)
            current = []
        current.extend(unit)
    if current:
        groups.append(current)
    lines = []
    for indices in groups:
        line_words = [{"text": clean(words[i]["word"]), "start_sec": words[i]["start"],
                       "end_sec": words[i]["end"],
                       **({"accent": True} if i in accent_indices else {})} for i in indices]
        lines.append({"start_sec": line_words[0]["start_sec"],
                      "end_sec": max(w["end_sec"] for w in line_words), "words": line_words,
                      "emphasis": mode == "center" and any(i in accent_indices for i in indices)})
    for index, line in enumerate(lines):
        next_start = lines[index + 1]["start_sec"] if index + 1 < len(lines) else duration
        end = line["end_sec"] + .14
        if next_start is not None:
            end = min(end, next_start)
        line["end_sec"] = max(line["end_sec"], end)
    return lines


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("words_json", type=Path)
    parser.add_argument("out_json", type=Path)
    parser.add_argument("--emphasis", default="", help="Cụm cần nhấn, cách nhau bằng |")
    parser.add_argument("--protect", default="", help="Tên/cụm không được ngắt, cách nhau bằng |")
    parser.add_argument("--max-words", type=int, default=6)
    parser.add_argument("--width", type=int, default=720)
    parser.add_argument("--fps", type=float, default=30)
    parser.add_argument("--duration", type=float)
    parser.add_argument("--emphasis-mode", choices=["inline", "center"], default="inline")
    args = parser.parse_args()
    words = json.loads(args.words_json.read_text())
    if not isinstance(words, list):
        raise ValueError("words.json phải là danh sách từ đã rà soát.")
    phrases = [re.sub(r":(?:underline|block)$", "", p.strip()) for p in args.emphasis.split("|") if p.strip()]
    protected = [p.strip() for p in args.protect.split("|") if p.strip()]
    lines = build(words, phrases, protected, args.width, args.max_words or 6,
                  args.emphasis_mode, args.duration)
    validate(words, lines, args.fps, args.duration)
    args.out_json.write_text(json.dumps(lines, ensure_ascii=False, indent=2) + "\n")
    print(f"[captions] {len(words)} từ -> {len(lines)} dòng; nhấn {args.emphasis_mode}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
