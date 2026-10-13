import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { EditedVideo, type BRoll } from "./EditedVideo";
import { GraphicsThemeProvider, useGraphicsTheme, type GraphicsThemeInput } from "./templates/GraphicsTheme";
import { FlowDiagram } from "./templates/FlowDiagram";
import { ConceptBuild } from "./templates/ConceptBuild";
import { ProgressSteps } from "./templates/ProgressSteps";
import { KeywordChips } from "./templates/KeywordChips";
import { Callout } from "./templates/Callout";
import { VsSplit } from "./templates/VsSplit";
import { ObjectTransform } from "./templates/ObjectTransform";
import { SpeakerCanvas } from "./templates/SpeakerCanvas";
import { AnnotatedScreenshot } from "./templates/AnnotatedScreenshot";

export const GraphicsTemplateCheck: React.FC<{ kind?: string; theme?: GraphicsThemeInput; videoSrc?: string }> = ({
  kind = "flow_diagram", theme = "dark-tech", videoSrc = "qa/source.mp4",
}) => <GraphicsThemeProvider config={theme}><TemplateCheckInner kind={kind} videoSrc={videoSrc} /></GraphicsThemeProvider>;
const TemplateCheckInner: React.FC<{ kind: string; videoSrc: string }> = ({ kind, videoSrc }) => {
  const t = useGraphicsTheme();
  const objects = [
    { id: "a", label: "Giáo án", appear_sec: 8.1 },
    { id: "b", label: "Bài tập", appear_sec: 8.6 },
    { id: "c", label: "Phản hồi", appear_sec: 9.1 },
  ];
  const elements = [
    { id: "a", label: "Dữ liệu", x: 0.22, y: 0.5, w: 0.32, appear_sec: 8.2 },
    { id: "b", label: "Trợ lý AI", x: 0.76, y: 0.5, w: 0.34, emphasis: true, appear_sec: 9.2 },
  ];
  const connectors = [{ from: "a", to: "b", flowing: true, appear_sec: 9.3 }];
  return <AbsoluteFill style={{ background: t.background }}>
    {kind === "flow_diagram" && <FlowDiagram title="Từ dữ liệu đến kết quả" nodes={[{ label: "Dữ liệu", appear_sec: 0.2 }, { label: "Xử lý", appear_sec: 1.0 }, { label: "Kết quả", highlight: true, appear_sec: 1.8 }]} />}
    {kind === "concept_build" && <ConceptBuild title="Tri thức của trung tâm" startSec={8} elements={elements} connectors={connectors} />}
    {kind === "progress_steps" && <ProgressSteps title="Chuẩn bị bài giảng" steps={[{ label: "Chọn mục tiêu", appear_sec: 0.2, active_sec: 0.8 }, { label: "Soạn hoạt động", appear_sec: 0.6, active_sec: 1.6 }, { label: "Rà soát đầu ra", appear_sec: 1.0, active_sec: 2.4 }]} />}
    {kind === "keyword_chips" && <KeywordChips title="Nguồn tri thức" chips={[{ text: "Giáo án", appear_sec: 0.2 }, { text: "Bài tập", appear_sec: 0.8 }, { text: "Phản hồi", active: true, appear_sec: 1.4 }]} />}
    {kind === "callout" && <Callout prefix="Bắt đầu từ" highlight="Một việc thật" suffix="Đo kết quả rồi cải tiến" />}
    {kind === "vs_split" && <VsSplit topLabel="Làm thủ công" topItems={["Tài liệu rời rạc", "Lặp lại từng bước"]} bottomLabel="Có hệ thống" bottomItems={["Tri thức tập trung", "Quy trình rõ ràng"]} />}
    {kind === "annotated_screenshot" && <AnnotatedScreenshot image_path="qa/screenshot.png" highlights={[{ x: 0.15, y: 0.3, w: 0.4, h: 0.2, appear_sec: 0.5 }]} />}
    {kind === "object_transform" && <ObjectTransform objects={objects} gatherSec={11} startSec={8} targetLabel="Kho tri thức" />}
    {kind === "pipeline" && <ObjectTransform objects={objects} gatherSec={11} startSec={8} targetLabel="Bài giảng" mode="pipeline" processLabel="Trợ lý AI" />}
    {kind === "speaker_canvas" && <SpeakerCanvas videoSrc={videoSrc} startSec={8} elements={elements} connectors={connectors} />}
  </AbsoluteFill>;
};

/** Technical demo in Vietnamese. No speech captions or claims about real data.
 * A supplied source enables the speaker layout; otherwise it shows graphics only. */
export const GraphicsShowcase: React.FC<{ videoSrc?: string }> = ({ videoSrc = "gradient" }) => {
  const { fps, width, height } = useVideoConfig();
  const f = useCurrentFrame();
  const themes = ["dark-tech", "light-minimal", "warm-story", "henry-brand"] as const;
  const names = ["01 · Công nghệ", "02 · Sáng tối giản", "03 · Ấm gần gũi", "04 · Henry"];
  const scene = Math.min(3, Math.floor(f / (6 * fps)));
  const plan: BRoll[] = [
    { kind: "flow_diagram", start_sec: 0, end_sec: 6, graphicsTheme: "dark-tech", reason: "Minh họa trình tự xử lý.",
      nodes: [{ label: "Dữ liệu", appear_sec: 0.5 }, { label: "Trợ lý AI", appear_sec: 1.5 }, { label: "Kết quả", appear_sec: 2.6, highlight: true }] },
    { kind: "progress_steps", start_sec: 6, end_sec: 12, graphicsTheme: "light-minimal", reason: "Các bước chuẩn bị bài giảng.",
      progress: [{ label: "Chọn mục tiêu", appear_sec: 6.5, active_sec: 7.0 }, { label: "Soạn hoạt động", appear_sec: 7.5, active_sec: 8.0 }, { label: "Rà soát đầu ra", appear_sec: 8.5, active_sec: 9.0 }] },
    { kind: "object_transform", start_sec: 12, end_sec: 18, graphicsTheme: "warm-story", reason: "Các tài liệu được gom thành kho tri thức.",
      objects: [{ id: "a", label: "Giáo án", appear_sec: 12.3 }, { id: "b", label: "Bài tập", appear_sec: 12.8 }, { id: "c", label: "Phản hồi", appear_sec: 13.3 }],
      target_label: "Kho tri thức", gather_sec: 15, transform_mode: "collect" },
    { kind: videoSrc === "gradient" ? "concept_build" : "speaker_canvas", start_sec: 18, end_sec: 24, graphicsTheme: "henry-brand", reason: "Người nói cùng vùng minh họa riêng.",
      visual: "concept_build", elements: [{ id: "a", label: "Tri thức", x: 0.22, y: 0.5, w: 0.30, appear_sec: 18.3 }, { id: "b", label: "Ứng dụng", x: 0.76, y: 0.5, w: 0.32, emphasis: true, appear_sec: 19.5 }],
      connectors: [{ from: "a", to: "b", flowing: true, appear_sec: 19.6 }] },
  ];
  return <AbsoluteFill>
    <EditedVideo videoSrc={videoSrc} broll={plan} zoom={[]} captions={[]} singleCaptionLayer styles={{ kenBurnsIntensity: 0, zoomEaseFrames: 0 }} />
    <div style={{ position: "absolute", top: height * 0.015, left: width * 0.04, fontFamily: "Arial, sans-serif",
      fontSize: Math.min(width, height) * 0.027, fontWeight: 700, color: scene === 1 || scene === 2 ? "#3E291F" : "#FFFFFF" }}>{names[scene]}</div>
    <div style={{ position: "absolute", bottom: height * 0.04, width, textAlign: "center", fontFamily: "Arial, sans-serif",
      fontSize: Math.min(width, height) * 0.023, color: scene === 1 || scene === 2 ? "#3E291F" : "#FFFFFF" }}>Mẫu kỹ thuật · Nội dung minh họa</div>
  </AbsoluteFill>;
};
