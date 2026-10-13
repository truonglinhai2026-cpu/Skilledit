import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { useFadeRise } from "./motion";
import {useMemo} from "react";

/**
 * Caption track for YouTube-intro mode.
 *
 * Two flavors, both driven by the same word-level transcript:
 *
 *  1. **Default (single layer):** white-on-shadow captions. Explicit accent
 *     words are uppercase, 1.25x larger and yellow; other words preserve
 *     transcript case and stay white. No separate duplicate text track.
 *
 *  2. **Emphasis (cinematic pop):** the same phrase lifts to true center,
 *     scales 0.8 → 1.0 with a soft spring, the lime-accent word drops a
 *     quick lime underline. Used sparingly (1–3 per intro) on the line that
 *     IS the promise.
 *
 * The component is fed a `lines` array — each line is a phrase with its
 * constituent words (each with absolute start/end times in source-video
 * seconds), plus an optional `emphasis` boolean.
 *
 * Because each line is wrapped in its own <Sequence>, lines pre-render at
 * their own start frame and clear at their own end frame — no global state.
 */

export type CaptionWord = {
  text: string;
  start_sec: number;
  end_sec: number;
  /** Explicit inline emphasis; mark every word in the selected phrase.
   *  Only the optional cinematic mode auto-picks an accent when absent. */
  accent?: boolean;
};

export type CaptionLine = {
  start_sec: number;
  end_sec: number;
  words: CaptionWord[];
  /** When true, render large in the center with a cinematic pop instead of
   *  the lower-third lane. */
  emphasis?: boolean;
  /** Style variant for emphasis lines (no-op for non-emphasis lines):
   *  - "underline" (default) — large white text, lime underline draws under
   *    the accent word.
   *  - "block" — accent word renders as raisin text inside a lime rectangular
   *    block (callout-style), surrounding text stays white.
   *
   *  Alternate the two within a video for visual variety — but don't go
   *  above two emphasis lines per minute regardless of style. */
  style?: "underline" | "block";
};

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "so", "to", "of", "in", "on",
  "at", "for", "with", "is", "are", "was", "were", "be", "been", "being",
  "i", "you", "he", "she", "it", "we", "they", "my", "your", "his", "her",
  "its", "our", "their", "this", "that", "these", "those", "do", "does",
  "did", "have", "has", "had", "will", "would", "can", "could", "should",
  "may", "might", "must", "as", "by", "from", "up", "out", "than", "then",
  "into", "about", "over", "no", "not",
]);

function pickAccentIdx(words: CaptionWord[]): number {
  const explicit = words.findIndex((w) => w.accent);
  if (explicit >= 0) return explicit;
  let bestIdx = 0;
  let bestLen = 0;
  for (let i = 0; i < words.length; i++) {
    const cleaned = words[i].text.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (STOP_WORDS.has(cleaned)) continue;
    if (cleaned.length > bestLen) {
      bestLen = cleaned.length;
      bestIdx = i;
    }
  }
  return bestIdx;
}

const LowerThirdLine: React.FC<{ line: CaptionLine }> = ({ line }) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps + line.start_sec;

  // Aspect-aware sizing. Shorts (portrait) get a larger relative size; the
  // YouTube-intro mode (16:9) keeps things tighter so the band doesn't crowd
  // the speaker's head.
  const isLandscape = width >= height;
  const fontSize = useMemo(() => {
    const desired = Math.round((isLandscape ? height : width) * 0.058);
    // Measure the actual mixed-case, mixed-size words and their gaps.
    // Raw transcript text remains untouched for timing/content validation.
    if (typeof document === "undefined") return desired;
    const context = document.createElement("canvas").getContext("2d");
    if (!context) return desired;
    const measured = line.words.reduce((total, w, i) => {
      const size = w.accent ? Math.round(desired * 1.25) : desired;
      context.font = `${w.accent ? 900 : (isLandscape ? 700 : 800)} ${size}px 'Be Vietnam Pro', Montserrat, Arial`;
      const shown = w.accent ? w.text.toUpperCase() : w.text;
      return total + context.measureText(shown).width + (i ? Math.round(desired * 0.28) : 0);
    }, 0);
    return Math.max(1, Math.min(desired, Math.floor(desired * width * .84 / Math.max(1, measured))));
  }, [line, width, height, isLandscape]);
  const padX = Math.round(width * (isLandscape ? 0.018 : 0.030));
  const padY = Math.round(fontSize * 0.30);
  const radius = Math.round(fontSize * 0.18);

  // Anchor near the very bottom — on shorts this keeps the caption band BELOW
  // the word_pop lower-third lane (~0.72) so caption + word_pop don't collide.
  // Still lifted enough to clear the mobile safe area / scrub bar.
  const bottomOffset = Math.round(height * (isLandscape ? 0.14 : 0.11));

  // Clean, steady subtitle display without flickering, fading dips, or jump-bouncing.
  const opacity = 1;

  // Always cardless with heavy multi-layer shadow to eliminate resizing dark boxes and flicker.
  const cardless = true;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: bottomOffset,
        display: "flex",
        justifyContent: "center",
        opacity,
      }}>
        <div style={{
          backgroundColor: cardless ? "transparent" : "rgba(15, 18, 26, 0.78)",
          borderRadius: cardless ? 0 : radius,
          padding: cardless ? 0 : `${padY}px ${padX * 1.2}px`,
          fontFamily: "'Be Vietnam Pro', Montserrat, Arial, system-ui, sans-serif",
          fontWeight: cardless ? 800 : 700,
          fontSize,
          lineHeight: 1.15,
          letterSpacing: "-0.005em",
          color: "#FFFFFF",
          textAlign: "center",
          textTransform: "none",
          // Cardless captions lean entirely on a heavy multi-layer shadow for
          // legibility over any background.
          textShadow: cardless
            ? "0 4px 22px rgba(0,0,0,0.92), 0 2px 8px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.7)"
            : "0 2px 8px rgba(0,0,0,0.55)",
          maxWidth: width * 0.86,
          whiteSpace: "nowrap",
          boxShadow: cardless
            ? "none"
            : `0 ${Math.round(fontSize * 0.18)}px ${Math.round(fontSize * 0.55)}px rgba(0,0,0,0.45)`,
          backdropFilter: cardless ? undefined : "blur(2px)",
        }}>
          {line.words.map((w, i) => {
            const isAccent = !!w.accent;
            const wordFontSize = isAccent ? Math.round(fontSize * 1.25) : fontSize;
            const color = isAccent ? "#FFE600" : "#FFFFFF";
            const fontWeight = isAccent ? 900 : (cardless ? 800 : 700);
            const textShadow = cardless
              ? "0 4px 22px rgba(0,0,0,0.92), 0 2px 8px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.7)"
              : "0 2px 8px rgba(0,0,0,0.55)";

            return (
              <span key={i} style={{
                display: "inline-block",
                color,
                fontWeight,
                fontSize: wordFontSize,
                textShadow,
                marginRight: i < line.words.length - 1 ? `${Math.round(fontSize * 0.28)}px` : 0,
              }}>
                {isAccent ? w.text.toUpperCase() : w.text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const EmphasisLine: React.FC<{ line: CaptionLine }> = ({ line }) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps + line.start_sec;

  const isLandscape = width >= height;
  const baseDim = isLandscape ? height : width;
  // Big, but auto-shrinks if the longest word would bleed outside 88% of
  // the frame width (same trick StatPunch uses).
  const longest = line.words.reduce((m, w) => Math.max(m, w.text.length), 1);
  const AVG_CHAR = 0.62;
  const SAFE = 0.88;
  const maxByWord = (width * SAFE) / (longest * AVG_CHAR);
  const fontSize = Math.round(Math.min(baseDim * 0.16, maxByWord));

  const accentIdx = pickAccentIdx(line.words);

  // Pop: spring scale 0.78 → 1.0 over 0.45s, hold, then small fade out
  const popFrame = Math.max(0, frame);
  const popK = spring({
    frame: popFrame,
    fps,
    durationInFrames: Math.round(0.45 * fps),
    config: { damping: 16, stiffness: 130, mass: 0.65 },
  });
  const scale = interpolate(popK, [0, 1], [0.78, 1.0]);
  const exitDur = 0.25;
  const exitK = interpolate(
    t,
    [line.end_sec - exitDur, line.end_sec],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = popK * exitK;

  // Lime underline draws under the accent word over the first 0.4s
  const underlineWipe = interpolate(
    t,
    [line.start_sec + 0.18, line.start_sec + 0.55],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{
      pointerEvents: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        opacity,
        transform: `scale(${scale})`,
        textAlign: "center",
        fontFamily: "'Be Vietnam Pro', Montserrat, Arial, system-ui, sans-serif",
        fontWeight: 700,
        fontSize,
        lineHeight: 1.0,
        letterSpacing: "-0.02em",
        color: "#FFFFFF",
        textShadow: "0 6px 28px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.55)",
        padding: width * 0.04,
        maxWidth: width * 0.94,
      }}>
        {line.words.map((w, i) => {
          const isAccent = i === accentIdx;
          const style = line.style ?? "underline";

          // BLOCK style: accent word renders as raisin-on-lime block (callout-style),
          // other words stay white. No underline.
          if (style === "block") {
            return (
              <span
                key={i}
                style={{
                  color: isAccent ? "#0F121A" : "#FFFFFF",
                  position: "relative",
                  display: "inline-block",
                  marginRight: i < line.words.length - 1 ? "0.18em" : 0,
                  padding: isAccent ? `${fontSize * 0.06}px ${fontSize * 0.18}px` : 0,
                  backgroundColor: isAccent ? "#CFFF05" : "transparent",
                  borderRadius: isAccent ? fontSize * 0.10 : 0,
                  boxShadow: isAccent ? `0 ${fontSize * 0.04}px ${fontSize * 0.10}px rgba(15,18,26,0.30)` : "none",
                  transform: isAccent ? `scale(${interpolate(underlineWipe, [0, 1], [0.85, 1])})` : "none",
                }}
              >
                {w.text}
              </span>
            );
          }

          // UNDERLINE style (default): white text, lime underline draws under accent word.
          return (
            <span
              key={i}
              style={{
                color: isAccent ? "#CFFF05" : "#FFFFFF",
                position: "relative",
                display: "inline-block",
                marginRight: i < line.words.length - 1 ? "0.28em" : 0,
              }}
            >
              {w.text}
              {isAccent && (
                <span style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: -fontSize * 0.06,
                  height: fontSize * 0.10,
                  backgroundColor: "#CFFF05",
                  transformOrigin: "left center",
                  transform: `scaleX(${underlineWipe})`,
                  borderRadius: fontSize * 0.05,
                }} />
              )}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC<{ lines: CaptionLine[]; singleLayer?: boolean }> = ({ lines, singleLayer = true }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {lines.map((line, idx) => {
        const from = Math.round(line.start_sec * fps);
        const end = Math.min(Math.round(line.end_sec * fps), lines[idx + 1] ? Math.round(lines[idx + 1].start_sec * fps) : Number.POSITIVE_INFINITY);
        if (end <= from) return null;
        const dur = end - from;
        return (
          <Sequence key={idx} from={from} durationInFrames={dur}>
            {line.emphasis && !singleLayer ? <EmphasisLine line={line} /> : <LowerThirdLine line={line} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
