#!/usr/bin/env python3
"""Optional transcript polish with an explicitly supplied ANTHROPIC_API_KEY.

The normal workflow uses local speech recognition and manual audio review.
No channel-specific correction vocabulary or external project credentials.
"""
from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

# Optional polish uses only an explicitly supplied API key. Local ASR and
# manual review are the default; no other project's wrappers or .env files.
HAVE_CLAUDE_WRAPPER = False
SYSTEM_PROMPT = """Review a transcript in its original language. Preserve all
spoken content and timestamps. Correct only clear, high-confidence single-token
mishearings supported by the surrounding words; preserve Vietnamese diacritics.
Do not guess a person's name, workshop title, brand, number or unfamiliar term.
Uncertain names require human/audio review. Do not assume a particular channel,
speaker, topic, or vocabulary. Return only a JSON array of corrections with
word_index, wrong, right, confidence='high', and a short reason. Return [] when
there is no well-supported correction. Never translate or rewrite the speech."""


def load_words(path: Path) -> list[dict]:
    return json.loads(path.read_text())


def build_user_prompt(words: list[dict]) -> str:
    """Send a numbered token list so Claude can return word_index precisely."""
    lines = []
    for i, w in enumerate(words):
        lines.append(f"{i}: {w['word']}")
    return ("Find context-aware mishearings in this transcript. "
            "Return a JSON array of high-confidence corrections.\n\n"
            "Numbered tokens:\n" + "\n".join(lines))




def get_corrections(words: list[dict]) -> list[dict]:
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("[polish] ANTHROPIC_API_KEY not set — skipping LLM polish step",
              file=sys.stderr)
        return []
    user_prompt = build_user_prompt(words)
    if HAVE_CLAUDE_WRAPPER:
        cc = ClaudeClient(max_tokens=2000)  # type: ignore[name-defined]
        text = cc.complete(system=SYSTEM_PROMPT, user=user_prompt)
    else:
        from anthropic import Anthropic
        ac = Anthropic()
        msg = ac.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_prompt}],
        )
        text = msg.content[0].text  # type: ignore[union-attr]
    # Extract JSON array from response. Use a depth-balanced scan to find the
    # first complete bracketed structure — handles cases where Claude returns
    # the array followed by an explanatory paragraph (which broke the simple
    # greedy regex). Also strips ```json fences if present.
    cleaned = re.sub(r"```(?:json)?\s*", "", text).replace("```", "").strip()
    start = cleaned.find("[")
    if start < 0:
        return []
    depth, end = 0, -1
    in_str, escape = False, False
    for i in range(start, len(cleaned)):
        ch = cleaned[i]
        if escape:
            escape = False
            continue
        if ch == "\\":
            escape = True
            continue
        if ch == '"':
            in_str = not in_str
            continue
        if in_str:
            continue
        if ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    if end < 0:
        return []
    try:
        return json.loads(cleaned[start:end])
    except Exception as e:
        print(f"[polish] LLM returned invalid JSON: {e}\n  raw: {cleaned[start:end][:200]!r}",
              file=sys.stderr)
        return []


HEDGE_WORDS = (
    "unsure", "uncertain", "skipping", "skip", "might", "could be",
    "however", "maybe", "possibly", "or 'a", "or '", "actually",
)


def apply_corrections(words: list[dict], fixes: list[dict]) -> int:
    """Apply each {word_index, wrong, right, confidence, reason} fix.

    Skips when:
    - confidence is missing or != 'high'
    - reason contains any HEDGE_WORDS (means the LLM was hedging)
    - the word at index doesn't actually match `wrong`
    - `right` would equal `wrong` (no-op)
    """
    applied = 0
    for fix in fixes:
        try:
            idx = int(fix["word_index"])
            wrong = str(fix["wrong"])
            right = str(fix["right"])
            reason = str(fix.get("reason", ""))
            conf = str(fix.get("confidence", "")).lower()
        except (KeyError, TypeError, ValueError):
            print(f"[polish] skipping malformed fix: {fix!r}", file=sys.stderr)
            continue
        if conf != "high":
            print(f"[polish] skipping low-confidence fix at idx {idx}: "
                  f"confidence={conf!r}, reason={reason!r}")
            continue
        reason_lower = reason.lower()
        if any(h in reason_lower for h in HEDGE_WORDS):
            print(f"[polish] skipping hedged fix at idx {idx}: {reason!r}")
            continue
        if idx < 0 or idx >= len(words):
            print(f"[polish] skipping out-of-range index {idx}", file=sys.stderr)
            continue
        actual = words[idx]["word"]
        if actual.lower() != wrong.lower():
            print(f"[polish] skipping mismatch at idx {idx}: actual={actual!r} "
                  f"vs wrong={wrong!r}", file=sys.stderr)
            continue
        if right == actual:
            continue  # no-op
        words[idx]["word"] = right
        applied += 1
        print(f"[polish] idx {idx}: {actual!r} → {right!r}  ({reason})")
    return applied


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: polish_transcript.py <words.json>", file=sys.stderr)
        return 2
    words_path = Path(sys.argv[1]).expanduser().resolve()
    if not words_path.exists():
        print(f"words.json not found: {words_path}", file=sys.stderr)
        return 2
    words = load_words(words_path)
    fixes = get_corrections(words)
    if not fixes:
        print("[polish] no corrections proposed")
        return 0
    applied = apply_corrections(words, fixes)
    if applied:
        words_path.write_text(json.dumps(words, indent=2))
        print(f"[polish] wrote {applied} correction(s) to {words_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
