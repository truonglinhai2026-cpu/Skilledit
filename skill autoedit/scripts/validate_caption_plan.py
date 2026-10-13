#!/usr/bin/env python3
"""Check that reviewed speech appears once and caption intervals do not overlap."""
from __future__ import annotations
import argparse
import json
import math
import re
import unicodedata
from pathlib import Path


def clean(text: str) -> str:
    text = unicodedata.normalize("NFC", text.strip())
    return re.sub(r'^[.,!?;:"(]+|[.,!?;:")]+$', "", text)


def validate(words: list[dict], lines: list[dict], fps: float = 30,
             duration: float | None = None) -> dict:
    if not lines and words:
        raise ValueError("Có lời nói nhưng không có phụ đề.")
    expected = [(clean(w["word"]), float(w["start"]), float(w["end"])) for w in words]
    actual = [(clean(w["text"]), float(w["start_sec"]), float(w["end_sec"]))
              for line in lines for w in line["words"]]
    if actual != expected:
        raise ValueError("Phụ đề thiếu, thêm, đổi thứ tự từ hoặc đổi thời điểm lời nói.")
    previous_end = 0.0
    previous_end_frame = 0
    for index, line in enumerate(lines):
        start, end = float(line["start_sec"]), float(line["end_sec"])
        if not math.isfinite(start + end) or start < 0 or end <= start:
            raise ValueError(f"Dòng {index + 1}: thời điểm không hợp lệ.")
        if start < previous_end - 1e-6:
            raise ValueError(f"Dòng {index + 1}: hai phụ đề cùng xuất hiện.")
        start_frame, end_frame = math.floor(start * fps + .5), math.floor(end * fps + .5)
        if start_frame < previous_end_frame or end_frame <= start_frame:
            raise ValueError(f"Dòng {index + 1}: thời gian hiển thị không hợp lệ ở {fps} fps.")
        if duration is not None and end > duration + 1 / fps:
            raise ValueError(f"Dòng {index + 1}: vượt thời lượng video.")
        for word in line["words"]:
            if not start - 1e-6 <= float(word["start_sec"]) <= float(word["end_sec"]) <= end + 1e-6:
                raise ValueError(f"Dòng {index + 1}: cần rà soát thời điểm của {word['text']!r}.")
        previous_end, previous_end_frame = end, end_frame
    return {"source_words": len(words), "caption_words": len(actual),
            "caption_lines": len(lines), "word_order_and_timestamps_preserved": True,
            "max_simultaneous_caption_lines": 1 if lines else 0}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("words_json", type=Path)
    parser.add_argument("captions_json", type=Path)
    parser.add_argument("--fps", type=float, default=30)
    parser.add_argument("--duration", type=float)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    try:
        result = validate(json.loads(args.words_json.read_text()),
                          json.loads(args.captions_json.read_text()), args.fps, args.duration)
    except (ValueError, KeyError, TypeError) as error:
        print(f"[captions] FAIL: {error}")
        return 1
    if args.report:
        args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(f"[captions] PASS: {result['caption_words']} từ, {result['caption_lines']} dòng; không lặp lớp phụ đề.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
