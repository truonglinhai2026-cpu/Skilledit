import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { ConceptBuild, type ConceptElement, type ConceptConnector } from "./ConceptBuild";
import { ObjectTransform, type TransformObject } from "./ObjectTransform";
import { DarkGridBg } from "./Backgrounds";
import { useGraphicsTheme } from "./GraphicsTheme";

export type SpeakerCanvasProps = {
  videoSrc: string; startSec: number; side?: "left" | "right";
  visual?: "concept_build" | "object_transform";
  elements?: ConceptElement[]; connectors?: ConceptConnector[];
  objects?: TransformObject[]; targetLabel?: string; gatherSec?: number;
  mode?: "collect" | "pipeline"; processLabel?: string;
};

/** Fits the WHOLE source into a separate region. A second muted video instance
 * uses the beat's source offset; the main EditedVideo instance owns the audio. */
export const SpeakerCanvas: React.FC<SpeakerCanvasProps> = ({
  videoSrc, startSec, side = "left", visual = "concept_build", elements = [], connectors = [],
  objects = [], targetLabel = "", gatherSec = startSec, mode, processLabel,
}) => {
  const { width, height, fps } = useVideoConfig();
  const t = useGraphicsTheme();
  const portrait = height > width;
  const leftSpeaker = side === "left";
  const speaker = portrait
    ? { x: width * 0.06, y: height * 0.04, w: width * 0.88, h: height * 0.38 }
    : { x: width * (leftSpeaker ? 0.04 : 0.62), y: height * 0.07, w: width * 0.34, h: height * 0.68 };
  const canvas = portrait
    ? { x: width * 0.05, y: height * 0.46, w: width * 0.90, h: height * 0.34 }
    : { x: width * (leftSpeaker ? 0.42 : 0.04), y: height * 0.07, w: width * 0.54, h: height * 0.68 };
  return <AbsoluteFill>
    <DarkGridBg />
    <div style={{ position: "absolute", left: speaker.x, top: speaker.y, width: speaker.w, height: speaker.h,
      background: "#000000", overflow: "hidden", borderRadius: t.radius * Math.min(width, height) / 1000, border: `1px solid ${t.border}`, boxSizing: "border-box" }}>
      <OffthreadVideo src={/^https?:\/\//i.test(videoSrc) ? videoSrc : staticFile(videoSrc)}
        startFrom={Math.round(startSec * fps)} muted style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    </div>
    <div style={{ position: "absolute", left: canvas.x, top: canvas.y, width: canvas.w, height: canvas.h,
      overflow: "hidden", borderRadius: t.radius * Math.min(width, height) / 1000, border: `1px solid ${t.border}` }}>
      <Sequence from={0} width={Math.round(canvas.w)} height={Math.round(canvas.h)}>
        {visual === "object_transform"
          ? <ObjectTransform compact objects={objects} targetLabel={targetLabel} gatherSec={gatherSec} startSec={startSec} mode={mode} processLabel={processLabel} />
          : <ConceptBuild compact elements={elements} connectors={connectors} startSec={startSec} />}
      </Sequence>
    </div>
  </AbsoluteFill>;
};
