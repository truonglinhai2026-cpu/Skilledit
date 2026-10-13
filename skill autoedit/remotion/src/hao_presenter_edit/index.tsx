import React from "react";
import {
  AbsoluteFill,
  Composition,
  OffthreadVideo,
  Sequence,
  interpolate,
  registerRoot,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const fps = 30;
const durationInFrames = 1800;
const videoSrc = staticFile("hao-presenter/presenter_clean_60.mp4");

const colors = {
  bg: "#04050a",
  bg2: "#0d0a07",
  gold: "#f6c85a",
  gold2: "#ff8a1d",
  cream: "#fff2d1",
  text: "#f7efe3",
  muted: "#a9a2a0",
  blue: "#3ac8ff",
  green: "#52e3a5",
  purple: "#b286ff",
  red: "#ff5e87",
};

const fontDisplay = `Bahnschrift, "Segoe UI Variable Display", "Segoe UI", Arial, sans-serif`;
const fontBody = `"Segoe UI Variable Text", "Segoe UI", Arial, sans-serif`;

const scenes = [
  {
    from: 0,
    to: 6,
    kicker: "AI EDITOR WORKFLOW",
    title: "Biến AI thành\nEDITOR\nCHUYÊN NGHIỆP",
    subtitle: "Không cần After Effects · Không cần thuê editor",
    mode: "hero",
  },
  {
    from: 6,
    to: 18,
    kicker: "VẤN ĐỀ",
    title: "Dựng video đang ăn quá nhiều thời gian",
    subtitle: "Cái khó không chỉ là quay, mà là tạo minh họa đủ đẹp để người xem hiểu nhanh.",
    mode: "problem",
  },
  {
    from: 18,
    to: 34,
    kicker: "QUY TRÌNH",
    title: "Từ ý tưởng đến B-roll hoàn chỉnh",
    subtitle: "Script rõ hơn, AI hiểu đúng hơn, output dễ sửa hơn.",
    mode: "workflow",
  },
  {
    from: 34,
    to: 47,
    kicker: "CÁCH LÀM",
    title: "HTML trước, video sau",
    subtitle: "HTML là bản nháp thị giác để chốt layout, font, màu và nhịp trình bày.",
    mode: "html",
  },
  {
    from: 47,
    to: 60,
    kicker: "KẾT QUẢ",
    title: "AI không thay editor.\nAI tạo bản nháp nhanh.",
    subtitle: "Người làm nội dung vẫn giữ gu, nhịp và quyết định cuối.",
    mode: "result",
  },
];

const workflow = [
  { step: "BƯỚC 1", icon: "💡", title: "PROMPT\nÝ TƯỞNG", body: "Mô tả đoạn cần minh họa", color: colors.gold2, tag: "INPUT" },
  { step: "BƯỚC 2", icon: "🤖", title: "AI\nVIẾT CODE", body: "Tạo HTML / Remotion scene", color: colors.blue, tag: "AI ENGINE" },
  { step: "BƯỚC 3", icon: "✨", title: "HTML\nTHAM CHIẾU", body: "Chốt layout, màu và chữ", color: colors.green, tag: "VISUAL" },
  { step: "BƯỚC 4", icon: "🎬", title: "RENDER\nB-ROLL", body: "Xuất MP4 để ghép video", color: colors.purple, tag: "OUTPUT" },
];

const useActiveScene = () => {
  const frame = useCurrentFrame();
  const sec = frame / fps;
  return scenes.find((s) => sec >= s.from && sec < s.to) ?? scenes[scenes.length - 1];
};

const fadeIn = (frame: number, delay = 0, dur = 20) =>
  interpolate(frame, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(135deg, ${colors.bg}, ${colors.bg2})`, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: "-15%",
          background: `radial-gradient(circle at ${72 + Math.sin(t / 4) * 4}% ${20 + Math.cos(t / 7) * 5}%, rgba(255,138,29,0.18), transparent 28%),
          radial-gradient(circle at ${20 + Math.cos(t / 6) * 6}% ${70 + Math.sin(t / 5) * 5}%, rgba(246,200,90,0.10), transparent 30%),
          radial-gradient(circle at 50% 50%, rgba(58,200,255,0.05), transparent 36%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(255,234,180,0.55) 0 1px, transparent 1.5px), linear-gradient(105deg, transparent 0 48%, rgba(246,200,90,0.06) 48.2% 48.5%, transparent 48.7%)",
          backgroundSize: "72px 72px, 420px 420px",
          transform: `translate(${(frame % 240) * -0.08}px, ${(frame % 240) * 0.05}px)`,
          opacity: 0.52,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 70,
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(255,138,29,0.85), transparent)",
          boxShadow: "0 0 24px rgba(255,138,29,0.8)",
        }}
      />
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{ children: React.ReactNode; align?: "left" | "center" }> = ({ children, align = "left" }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      color: colors.gold,
      fontFamily: fontDisplay,
      fontWeight: 850,
      fontSize: 28,
      letterSpacing: 0,
      justifyContent: align === "center" ? "center" : "flex-start",
      textTransform: "uppercase",
      textShadow: "0 0 18px rgba(246,200,90,0.45)",
    }}
  >
    <span style={{ width: 48, height: 4, background: colors.gold, boxShadow: "0 0 16px rgba(246,200,90,0.7)" }} />
    {children}
  </div>
);

const GoldTitle: React.FC<{ text: string; size?: number; center?: boolean }> = ({ text, size = 86, center = false }) => (
  <div
    style={{
      marginTop: 22,
      whiteSpace: "pre-line",
      fontFamily: fontDisplay,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 0.95,
      letterSpacing: 0,
      textAlign: center ? "center" : "left",
      color: colors.cream,
      textShadow: "0 0 22px rgba(246,200,90,0.28)",
    }}
  >
    {text.split("\n").map((line, i) => (
      <React.Fragment key={i}>
        <span
          style={{
            color: i >= 1 ? colors.gold2 : colors.cream,
            background: i >= 1 ? `linear-gradient(90deg, ${colors.cream}, ${colors.gold}, ${colors.gold2})` : undefined,
            WebkitBackgroundClip: i >= 1 ? "text" : undefined,
            WebkitTextFillColor: i >= 1 ? "transparent" : undefined,
          }}
        >
          {line}
        </span>
        {i < text.split("\n").length - 1 ? <br /> : null}
      </React.Fragment>
    ))}
  </div>
);

const PresenterFrame: React.FC<{ variant: "wide" | "pip" | "vertical"; muted?: boolean }> = ({ variant, muted }) => {
  const frame = useCurrentFrame();
  const scale = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const styleByVariant: Record<typeof variant, React.CSSProperties> = {
    wide: { width: 500, height: 890, borderRadius: 26 },
    pip: { width: 380, height: 676, borderRadius: 24 },
    vertical: { width: 820, height: 670, borderRadius: 28 },
  };
  const innerFit = variant === "vertical" ? "cover" : "cover";
  return (
    <div
      style={{
        ...styleByVariant[variant],
        position: "relative",
        overflow: "hidden",
        border: `2px solid rgba(246,200,90,0.72)`,
        boxShadow: "0 0 28px rgba(246,200,90,0.34), 0 28px 80px rgba(0,0,0,0.5)",
        background: "#111",
        transform: `scale(${0.96 + scale * 0.04})`,
      }}
    >
      <OffthreadVideo
        src={videoSrc}
        muted={muted}
        style={{
          width: "100%",
          height: "100%",
          objectFit: innerFit,
          objectPosition: variant === "wide" ? "52% 50%" : "50% 44%",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 42px rgba(255,138,29,0.22)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

const HeroScene: React.FC<{ scene: (typeof scenes)[number]; wide?: boolean }> = ({ scene, wide = true }) => {
  const frame = useCurrentFrame();
  const p = fadeIn(frame, 5, 24);
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 22}px)` }}>
      <Kicker>{scene.kicker}</Kicker>
      <GoldTitle text={scene.title} size={wide ? 104 : 76} />
      <div style={{ marginTop: 28, color: colors.muted, fontFamily: fontBody, fontSize: wide ? 30 : 24, fontWeight: 650 }}>
        {scene.subtitle}
      </div>
    </div>
  );
};

const ProblemScene: React.FC<{ wide?: boolean }> = ({ wide = true }) => {
  const frame = useCurrentFrame();
  const items = [
    ["01", "Quay xong chưa phải xong", "Còn script, minh họa, caption, thumbnail."],
    ["02", "B-roll là phần tốn công", "Muốn dễ hiểu phải có visual đủ rõ."],
    ["03", "Tự động 100% không phải đích", "Đích là nhanh hơn nhưng vẫn giữ gu."],
  ];
  return (
    <div>
      <Kicker>VẤN ĐỀ THẬT</Kicker>
      <GoldTitle text={"Creator cần\nmột workflow dựng\nnhanh hơn"} size={wide ? 80 : 58} />
      <div style={{ display: "grid", gap: wide ? 18 : 14, marginTop: wide ? 36 : 24 }}>
        {items.map(([n, title, body], i) => {
          const p = fadeIn(frame, 8 + i * 8, 18);
          return (
            <div
              key={title}
              style={{
                opacity: p,
                transform: `translateX(${(1 - p) * -30}px)`,
                display: "grid",
                gridTemplateColumns: wide ? "72px 1fr" : "58px 1fr",
                gap: 18,
                padding: wide ? "20px 22px" : "17px 18px",
                borderRadius: 18,
                border: "1px solid rgba(246,200,90,0.28)",
                background: "rgba(255,240,210,0.055)",
              }}
            >
              <div style={{ color: colors.gold2, fontFamily: fontDisplay, fontSize: wide ? 32 : 26, fontWeight: 900 }}>{n}</div>
              <div>
                <div style={{ color: colors.text, fontFamily: fontDisplay, fontSize: wide ? 28 : 23, fontWeight: 850 }}>{title}</div>
                <div style={{ color: colors.muted, fontSize: wide ? 21 : 18, lineHeight: 1.35, marginTop: 4 }}>{body}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WorkflowCards: React.FC<{ wide?: boolean }> = ({ wide = true }) => {
  const frame = useCurrentFrame();
  return (
    <div>
      <Kicker>{wide ? "QUY TRÌNH TẠO VIDEO TỰ ĐỘNG" : "QUY TRÌNH"}</Kicker>
      <div style={{ color: colors.muted, fontSize: wide ? 24 : 20, fontWeight: 700, marginTop: 8 }}>
        Từ ý tưởng → HTML tham chiếu → video MP4
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: wide ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
          gap: wide ? 26 : 16,
          marginTop: wide ? 50 : 24,
        }}
      >
        {workflow.map((w, i) => {
          const p = spring({ frame: frame - 10 - i * 8, fps, config: { damping: 16, stiffness: 110 } });
          return (
            <div
              key={w.title}
              style={{
                minHeight: wide ? 390 : 260,
                borderRadius: 26,
                border: `2px solid ${w.color}`,
                boxShadow: `0 0 24px ${w.color}55, inset 0 0 38px ${w.color}16`,
                background: "rgba(0,0,0,0.42)",
                padding: wide ? 28 : 20,
                display: "grid",
                alignContent: "center",
                justifyItems: "center",
                textAlign: "center",
                opacity: p,
                transform: `translateY(${(1 - p) * 34}px)`,
              }}
            >
              <div style={{ color: w.color, fontFamily: fontDisplay, fontSize: wide ? 24 : 18, fontWeight: 900 }}>{w.step}</div>
              <div style={{ fontSize: wide ? 56 : 38, margin: "24px 0 18px", filter: `drop-shadow(0 0 18px ${w.color})` }}>{w.icon}</div>
              <div style={{ whiteSpace: "pre-line", color: colors.cream, fontFamily: fontDisplay, fontSize: wide ? 36 : 25, fontWeight: 900, lineHeight: 1.08 }}>
                {w.title}
              </div>
              <div style={{ color: colors.muted, fontSize: wide ? 20 : 16, lineHeight: 1.34, marginTop: 18 }}>{w.body}</div>
              <div style={{ marginTop: 18, padding: "7px 22px", borderRadius: 999, border: `1px solid ${w.color}`, color: w.color, fontWeight: 850, fontSize: wide ? 16 : 13 }}>
                {w.tag}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HtmlScene: React.FC<{ wide?: boolean }> = ({ wide = true }) => {
  const frame = useCurrentFrame();
  const p = fadeIn(frame, 8, 20);
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
      <Kicker>HTML THAM CHIẾU</Kicker>
      <GoldTitle text={"Làm bản nháp thị giác\ntrước khi render"} size={wide ? 78 : 56} />
      <div style={{ display: "grid", gap: 14, marginTop: wide ? 34 : 22 }}>
        {[
          ["Layout", "Chốt bố cục trước khi code video."],
          ["Font & màu", "Giữ đúng tone thương hiệu."],
          ["Motion", "Sửa nhịp từng vòng, không đoán mò."],
        ].map(([title, body], i) => (
          <div
            key={title}
            style={{
              display: "grid",
              gridTemplateColumns: wide ? "150px 1fr" : "110px 1fr",
              gap: 18,
              padding: wide ? 20 : 16,
              borderRadius: 18,
              border: "1px solid rgba(246,200,90,0.25)",
              background: "linear-gradient(90deg, rgba(255,138,29,0.12), rgba(255,255,255,0.035))",
            }}
          >
            <div style={{ color: colors.gold, fontFamily: fontDisplay, fontWeight: 900, fontSize: wide ? 26 : 20 }}>{title}</div>
            <div style={{ color: colors.muted, fontSize: wide ? 22 : 17 }}>{body}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResultScene: React.FC<{ wide?: boolean }> = ({ wide = true }) => (
  <div>
    <Kicker>KẾT QUẢ THỰC TẾ</Kicker>
    <GoldTitle text={"AI tạo bản nháp nhanh.\nBạn giữ tiêu chuẩn cuối."} size={wide ? 82 : 58} />
    <div
      style={{
        marginTop: wide ? 44 : 28,
        padding: wide ? "30px 34px" : "22px 24px",
        borderRadius: 26,
        border: "1px solid rgba(246,200,90,0.38)",
        background: "rgba(255,240,210,0.06)",
        color: colors.muted,
        fontSize: wide ? 27 : 20,
        lineHeight: 1.4,
      }}
    >
      Một workflow tốt không cần tự động hóa toàn bộ. Nó cần giúp người làm nội dung tiết kiệm thời gian mà vẫn kiểm soát được chất lượng.
    </div>
  </div>
);

const SceneContent: React.FC<{ wide?: boolean }> = ({ wide = true }) => {
  const scene = useActiveScene();
  if (scene.mode === "hero") return <HeroScene scene={scene} wide={wide} />;
  if (scene.mode === "problem") return <ProblemScene wide={wide} />;
  if (scene.mode === "workflow") return <WorkflowCards wide={wide} />;
  if (scene.mode === "html") return <HtmlScene wide={wide} />;
  return <ResultScene wide={wide} />;
};

const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 7, background: "rgba(255,255,255,0.08)" }}>
      <div
        style={{
          height: "100%",
          width: `${interpolate(frame, [0, durationInFrames], [0, 100])}%`,
          background: `linear-gradient(90deg, ${colors.gold}, ${colors.gold2})`,
          boxShadow: "0 0 18px rgba(255,138,29,0.75)",
        }}
      />
    </div>
  );
};

const WideComposition: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: fontBody, color: colors.text }}>
    <Background />
    <div style={{ position: "absolute", left: 44, top: 42, width: 1260, height: 996, padding: "30px 36px" }}>
      <SceneContent wide />
    </div>
    <div style={{ position: "absolute", right: 58, top: 74 }}>
      <PresenterFrame variant="wide" />
    </div>
    <Progress />
  </AbsoluteFill>
);

const VerticalComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = useActiveScene();
  const showLargePresenter = scene.mode === "hero";
  return (
    <AbsoluteFill style={{ fontFamily: fontBody, color: colors.text }}>
      <Background />
      <div style={{ position: "absolute", left: 50, right: 50, top: 72, height: showLargePresenter ? 800 : 1120 }}>
        <SceneContent wide={false} />
      </div>
      <div
        style={{
          position: "absolute",
          left: showLargePresenter ? 130 : 620,
          bottom: showLargePresenter ? 120 : 72,
          opacity: fadeIn(frame, 4, 18),
        }}
      >
        <PresenterFrame variant={showLargePresenter ? "vertical" : "pip"} />
      </div>
      <Progress />
    </AbsoluteFill>
  );
};

const Root: React.FC = () => (
  <>
    <Composition id="HaoPresenterWide" component={WideComposition} durationInFrames={durationInFrames} fps={fps} width={1920} height={1080} />
    <Composition id="HaoPresenterVertical" component={VerticalComposition} durationInFrames={durationInFrames} fps={fps} width={1080} height={1920} />
  </>
);

registerRoot(Root);
