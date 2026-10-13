import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DarkGridBg } from "./Backgrounds";
import { rgba, useGraphicsTheme } from "./GraphicsTheme";

export type TransformObject = { id: string; label: string; appear_sec: number; transform_sec?: number };
export type ObjectTransformProps = {
  objects: TransformObject[];
  targetLabel: string;
  gatherSec: number;
  startSec: number;
  mode?: "collect" | "pipeline";
  processLabel?: string;
  compact?: boolean;
};
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) } as const;

/** Documents travel into a folder or through a processing stage. Labels are
 * short object identifiers, not a second caption track. All times are absolute. */
export const ObjectTransform: React.FC<ObjectTransformProps> = ({
  objects, targetLabel, gatherSec, startSec, mode = "collect", processLabel = "Xử lý", compact = false,
}) => {
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = useGraphicsTheme();
  const now = startSec + frame / fps;
  const base = Math.min(width, height) * (compact ? 1.35 : 1);
  const targetEnter = interpolate(now, [gatherSec - 0.35, gatherSec], [0, 1], clamp);
  const exit = interpolate(frame, [Math.max(0, durationInFrames - fps * 0.25), durationInFrames], [1, 0], clamp);
  const destination = mode === "collect" ? { x: 0.5, y: 0.67 } : { x: 0.80, y: 0.52 };
  const n = objects.length;
  const cardW = width * (mode === "collect" ? 0.22 : 0.19);
  const cardH = Math.min(height * 0.20, cardW * 1.20);
  return (
    <AbsoluteFill>
      <DarkGridBg />
      <AbsoluteFill style={{ opacity: exit, fontFamily: t.fontFamily }}>
        {mode === "pipeline" && <>
          <svg width={width} height={height} style={{ position: "absolute" }}>
            <path d={`M ${width * 0.17} ${height * 0.52} H ${width * 0.80}`} stroke={t.border} strokeWidth={base * 0.007} strokeDasharray={`${base * 0.02} ${base * 0.01}`} fill="none" />
          </svg>
          <div style={{ position: "absolute", left: "40%", top: "38%", width: "20%", height: "28%",
            opacity: targetEnter, border: `2px solid ${t.accent}`, borderRadius: t.radius * base / 1000,
            background: t.surface, display: "flex", alignItems: "center", justifyContent: "center",
            color: t.text, fontSize: base * 0.035, fontWeight: 700, textAlign: "center", padding: base * 0.012, boxSizing: "border-box" }}>
            {processLabel}
          </div>
        </>}
        <div style={{ position: "absolute", left: `${(destination.x - (mode === "collect" ? 0.17 : 0.12)) * 100}%`,
          top: `${(destination.y - 0.10) * 100}%`, width: mode === "collect" ? "34%" : "24%", height: "24%", opacity: targetEnter }}>
          <svg viewBox="0 0 240 160" width="100%" height="100%" preserveAspectRatio="none">
            <path d="M 4 35 Q 4 26 14 26 H 88 L 104 42 H 226 Q 236 42 236 52 V 145 Q 236 155 226 155 H 14 Q 4 155 4 145 Z" fill={t.surface} stroke={t.accent} strokeWidth="3" />
            <path d="M 4 74 H 236 V 145 Q 236 155 226 155 H 14 Q 4 155 4 145 Z" fill={rgba(t.accent, 0.20)} />
          </svg>
          <div style={{ position: "absolute", top: "100%", left: "-10%", width: "120%", textAlign: "center",
            color: t.text, fontSize: base * 0.035, fontWeight: 700, lineHeight: 1.25, overflowWrap: "anywhere" }}>{targetLabel}</div>
        </div>
        {objects.map((obj, i) => {
          const enter = interpolate(now, [obj.appear_sec, obj.appear_sec + 0.28], [0, 1], clamp);
          const transformAt = obj.transform_sec ?? gatherSec + i * 0.22;
          const p = interpolate(now, [transformAt, transformAt + 0.75], [0, 1], clamp);
          const origin = mode === "collect"
            ? { x: 0.20 + (i % 3) * 0.30, y: 0.20 + Math.floor(i / 3) * 0.23 }
            : { x: 0.17, y: 0.20 + i * (0.60 / Math.max(1, n - 1)) };
          const x = interpolate(p, [0, 0.5, 1], [origin.x, mode === "pipeline" ? 0.5 : (origin.x + destination.x) / 2, destination.x]);
          const y = interpolate(p, [0, 0.5, 1], [origin.y, mode === "pipeline" ? 0.52 : (origin.y + destination.y) / 2 - 0.06 * t.motionFactor, destination.y]);
          return <div key={obj.id} style={{ position: "absolute", left: x * width - cardW / 2, top: y * height - cardH / 2,
            width: cardW, height: cardH, opacity: enter * interpolate(p, [0, 0.80, 1], [1, 1, 0]),
            transform: `scale(${(0.96 + 0.04 * enter) * (1 - 0.55 * p)}) rotate(${(1 - p) * (i % 2 === 0 ? -4 : 4) * t.motionFactor}deg)`,
            background: t.card, color: t.cardText, border: `1px solid ${t.border}`, borderRadius: t.radius * base / 1000,
            boxShadow: `0 ${base * 0.01}px ${base * 0.025}px rgba(0,0,0,0.12)`, boxSizing: "border-box", padding: cardW * 0.12 }}>
            <svg viewBox="0 0 100 60" width="100%" height="42%">
              <path d="M 14 12 H 84 M 14 27 H 70 M 14 42 H 78" stroke={t.accent} strokeWidth="5" strokeLinecap="round" fill="none" />
            </svg>
            <div style={{ fontSize: base * 0.028, fontWeight: 700, lineHeight: 1.18, overflowWrap: "anywhere", textAlign: "center" }}>{obj.label}</div>
          </div>;
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
