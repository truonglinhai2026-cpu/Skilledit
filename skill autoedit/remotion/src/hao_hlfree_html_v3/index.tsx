import React from "react";
import {
  AbsoluteFill,
  Composition,
  OffthreadVideo,
  interpolate,
  registerRoot,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";

const fps = 30;
const durationInFrames = 1800;
const presenterSrc = staticFile("hao-presenter/presenter_clean_60.mp4");

const c = {
  bg: "#100b08",
  bg2: "#1a110b",
  panel: "#24170f",
  panel2: "#2d1c11",
  panel3: "#382315",
  ink: "#fff3e6",
  cream: "#fff0df",
  muted: "#d2b8a2",
  soft: "#9b7b66",
  orange: "#ff7a1a",
  orange2: "#ffb347",
  line: "rgba(255, 139, 38, 0.25)",
  green: "#2ee5af",
  red: "#ff6a4f",
};

const font = `Inter, "Be Vietnam Pro", "Segoe UI", Arial, sans-serif`;

const scenes = [
  {
    from: 0,
    to: 6,
    eyebrow: "Creative Lab by Hào Lâm",
    right: "HL Free · AI cho creator",
    title: "Claude Tự\nEdit Video?",
    highlight: "Edit Video?",
    subtitle: "Hào thử workflow tạo B-roll bằng AI để xem nó có thật sự tiết kiệm thời gian edit hay không.",
    mode: "hero",
  },
  {
    from: 6,
    to: 18,
    eyebrow: "Vấn đề thật",
    right: "Creator solo rất dễ kiệt sức",
    title: "Edit video đang ăn quá nhiều\nthời gian",
    highlight: "thời gian",
    subtitle: "Không chỉ quay. Những phần tưởng nhỏ như B-roll, motion text, UI mockup lại ăn rất nhiều thời gian.",
    mode: "problem",
  },
  {
    from: 18,
    to: 34,
    eyebrow: "Quy trình",
    right: "Script rõ thì AI mới làm đúng",
    title: "Từ ý tưởng đến\nB-roll minh hoạ",
    highlight: "B-roll minh hoạ",
    subtitle: "Thay vì edit tay từng hiệu ứng, mình dùng AI dựng một HTML scene rồi render thành video.",
    mode: "workflow",
  },
  {
    from: 34,
    to: 47,
    eyebrow: "Cách làm đúng",
    right: "HTML trước · Video sau",
    title: "Làm HTML trước\nrồi mới render",
    highlight: "HTML trước",
    subtitle: "HTML là bản nháp thị giác: nhìn được bố cục, màu, chữ, motion trước khi xuất ra B-roll.",
    mode: "html",
  },
  {
    from: 47,
    to: 60,
    eyebrow: "Kết luận thực tế",
    right: "Không ảo tưởng AI làm hết",
    title: "AI tạo bản nháp nhanh.\nMình giữ tiêu chuẩn.",
    highlight: "Mình giữ tiêu chuẩn.",
    subtitle: "Workflow này không thay editor hoàn toàn, nhưng giúp creator làm minh hoạ nhanh và có kiểm soát hơn.",
    mode: "result",
  },
];

const bulletsByMode: Record<string, Array<{ icon: string; title: string; body: string; tag?: string }>> = {
  hero: [
    { icon: "🎬", title: "Review + tutorial nhẹ", body: "Không khoe tool suông, có quy trình để mọi người hình dung cách làm." },
    { icon: "⚠️", title: "Không ảo tưởng AI làm hết", body: "AI tạo bản nháp nhanh, người làm nội dung vẫn giữ tiêu chuẩn." },
  ],
  problem: [
    { icon: "🧠", title: "Không chỉ có quay", body: "Một video còn có ý tưởng, kịch bản, thu âm, edit, thumbnail, SEO." },
    { icon: "⏳", title: "Riêng edit đã rất nặng", body: "Càng nhiều minh hoạ, timeline càng phình và càng mất kiểm soát." },
    { icon: "🎯", title: "B-roll dễ bị xem nhẹ", body: "Nhưng chính B-roll giúp video dễ hiểu, đỡ nhàm và giữ người xem tốt hơn." },
  ],
  html: [
    { icon: "✨", title: "Chốt style trước", body: "Màu, font, card, glow, motion phải nhìn ổn trước khi render." },
    { icon: "🧩", title: "Đưa yêu cầu rõ", body: "Nói đoạn này minh hoạ gì, tone màu ra sao, output để đâu." },
    { icon: "🎞️", title: "Render rồi kiểm lại", body: "Không nhận output mù quáng. Xem, sửa, render lại." },
  ],
  result: [
    { icon: "⚡", title: "Nhanh hơn", body: "Những motion nhỏ không còn phải làm thủ công từng lớp." },
    { icon: "🧭", title: "Dễ kiểm soát hơn", body: "HTML preview giúp chốt style trước khi render." },
    { icon: "🛡️", title: "Vẫn cần gu", body: "AI phụ tá tạo nháp nhanh, tiêu chuẩn cuối vẫn là của mình." },
  ],
};

const workflow = [
  { step: "01", icon: "💡", title: "Prompt ý tưởng", body: "Mô tả đoạn cần minh hoạ", tag: "INPUT" },
  { step: "02", icon: "🤖", title: "AI viết code", body: "Claude / Codex dựng HTML scene", tag: "AI" },
  { step: "03", icon: "✨", title: "HTML preview", body: "Kiểm bố cục, màu, motion", tag: "STYLE" },
  { step: "04", icon: "🎞️", title: "Render B-roll", body: "Xuất video để ghép vào edit", tag: "OUTPUT" },
];

const clamp = (n: number) => Math.max(0, Math.min(1, n));

const localProgress = (frame: number, from: number, to: number) => clamp((frame - from * fps) / ((to - from) * fps));

const pop = (frame: number, delay = 0) =>
  spring({
    frame: frame - delay,
    fps,
    config: { damping: 17, stiffness: 105, mass: 0.75 },
  });

const enterStyle = (frame: number, delay = 0, distance = 18): React.CSSProperties => {
  const p = pop(frame, delay);
  return {
    opacity: interpolate(frame - delay, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${(1 - p) * distance}px) scale(${0.985 + p * 0.015})`,
  };
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 140) * 18;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${50 + drift / 10}% 0%, rgba(255,122,26,0.20), transparent 36%), linear-gradient(180deg, ${c.bg2}, ${c.bg})`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,139,38,0.052) 1px, transparent 1px), linear-gradient(90deg, rgba(255,139,38,0.052) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          transform: `translate(${-(frame % 64)}px, ${-(frame % 64) * 0.35}px)`,
          opacity: 0.58,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 760,
          height: 760,
          borderRadius: "50%",
          right: -180,
          top: -240,
          background: "radial-gradient(circle, rgba(255,122,26,0.16), transparent 65%)",
          filter: "blur(8px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -180,
          bottom: -260,
          width: 680,
          height: 680,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,179,71,0.11), transparent 68%)",
          filter: "blur(10px)",
        }}
      />
    </AbsoluteFill>
  );
};

const Shell: React.FC<{ children: React.ReactNode; wide: boolean; sceneFrame: number }> = ({ children, wide, sceneFrame }) => (
  <div
    style={{
      position: "relative",
      width: "100%",
      height: "100%",
      padding: wide ? 34 : 28,
      border: `1px solid ${c.line}`,
      borderRadius: wide ? 22 : 20,
      overflow: "hidden",
      background: `linear-gradient(145deg, rgba(45,28,17,0.98), rgba(20,12,8,0.98))`,
      boxShadow: "0 0 34px rgba(255,122,26,0.16), 0 34px 80px rgba(0,0,0,0.42)",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.055) 44%, transparent 60%)",
        transform: `translateX(${interpolate(sceneFrame, [0, 26, 52], [-120, 115, 115], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}%)`,
      }}
    />
    {children}
  </div>
);

const Header: React.FC<{ scene: (typeof scenes)[number]; sceneFrame: number }> = ({ scene, sceneFrame }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "center", ...enterStyle(sceneFrame, 0, 10) }}>
    <div
      style={{
        color: c.orange2,
        border: "1px solid rgba(255,122,26,0.42)",
        background: "rgba(255,122,26,0.12)",
        borderRadius: 999,
        padding: "8px 14px",
        fontSize: 14,
        fontWeight: 900,
      }}
    >
      {scene.eyebrow}
    </div>
    <div style={{ color: c.muted, fontWeight: 850, fontSize: 14, textAlign: "right" }}>{scene.right}</div>
  </div>
);

const TitleBlock: React.FC<{ scene: (typeof scenes)[number]; sceneFrame: number; wide: boolean }> = ({ scene, sceneFrame, wide }) => {
  const parts = scene.title.split(scene.highlight);
  return (
    <div style={{ marginTop: wide ? 46 : 34, ...enterStyle(sceneFrame, 5, 18) }}>
      <div
        style={{
          whiteSpace: "pre-line",
          color: c.cream,
          fontSize: wide ? 72 : 54,
          lineHeight: 0.98,
          fontWeight: 950,
          letterSpacing: 0,
        }}
      >
        {parts.length > 1 ? (
          <>
            {parts[0]}
            <span style={{ color: c.orange }}>{scene.highlight}</span>
            {parts.slice(1).join(scene.highlight)}
          </>
        ) : (
          scene.title
        )}
      </div>
      <div style={{ marginTop: 20, color: c.muted, fontSize: wide ? 23 : 24, lineHeight: 1.35, fontWeight: 650, maxWidth: wide ? 940 : 900 }}>
        {scene.subtitle}
      </div>
    </div>
  );
};

const InfoCard: React.FC<{ item: { icon: string; title: string; body: string; tag?: string }; delay: number; sceneFrame: number; compact?: boolean }> = ({
  item,
  delay,
  sceneFrame,
  compact,
}) => (
  <div
    style={{
      ...enterStyle(sceneFrame, delay, 16),
      display: "flex",
      gap: 14,
      alignItems: "flex-start",
      padding: compact ? "14px 15px" : "18px 18px",
      border: `1px solid ${c.line}`,
      borderRadius: 14,
      background: "rgba(255,240,223,0.06)",
      boxShadow: "0 0 18px rgba(255,122,26,0.08)",
    }}
  >
    <div
      style={{
        flex: "0 0 auto",
        width: compact ? 34 : 42,
        height: compact ? 34 : 42,
        borderRadius: 11,
        display: "grid",
        placeItems: "center",
        background: "rgba(255,122,26,0.14)",
        border: "1px solid rgba(255,139,38,0.26)",
        fontSize: compact ? 18 : 22,
      }}
    >
      {item.icon}
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ color: c.cream, fontWeight: 930, fontSize: compact ? 19 : 24, lineHeight: 1.12 }}>{item.title}</div>
      <div style={{ marginTop: 6, color: c.muted, fontSize: compact ? 14 : 17, lineHeight: 1.32, fontWeight: 620 }}>{item.body}</div>
    </div>
    {item.tag ? (
      <div
        style={{
          marginLeft: "auto",
          color: c.orange2,
          border: "1px solid rgba(255,139,38,0.26)",
          background: "rgba(255,122,26,0.12)",
          padding: "5px 10px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 900,
        }}
      >
        {item.tag}
      </div>
    ) : null}
  </div>
);

const OutputMock: React.FC<{ sceneFrame: number; wide: boolean }> = ({ sceneFrame, wide }) => {
  const pulse = 0.45 + Math.sin(sceneFrame / 18) * 0.18;
  return (
    <div
      style={{
        ...enterStyle(sceneFrame, 20, 18),
        marginTop: wide ? 26 : 22,
        border: `1px solid ${c.line}`,
        borderRadius: 16,
        padding: wide ? 18 : 15,
        background: "#0d0907",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03), 0 0 28px rgba(255,122,26,0.10)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: c.muted, fontWeight: 900, fontSize: wide ? 16 : 13 }}>
        <span>Claude / Remotion output</span>
        <span
          style={{
            color: c.orange2,
            border: "1px solid rgba(255,139,38,0.28)",
            background: "rgba(255,122,26,0.12)",
            padding: "5px 10px",
            borderRadius: 999,
          }}
        >
          B-roll
        </span>
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i === 0 ? c.orange : "rgba(255,122,26,0.42)" }} />
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        {[86, 96, 58, 74].map((w, i) => (
          <div
            key={i}
            style={{
              width: `${w}%`,
              height: wide ? 13 : 10,
              borderRadius: 999,
              marginBottom: wide ? 14 : 11,
              background: `rgba(255,240,223,${0.09 + i * 0.018})`,
              transform: `scaleX(${interpolate(sceneFrame, [22 + i * 5, 42 + i * 5], [0.15, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })})`,
              transformOrigin: "left",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: wide ? 4 : 0 }}>
        <div
          style={{
            width: wide ? 154 : 118,
            height: wide ? 92 : 72,
            borderRadius: 16,
            display: "grid",
            placeItems: "center",
            color: c.orange,
            fontSize: wide ? 30 : 24,
            background: "linear-gradient(135deg, rgba(255,122,26,0.36), rgba(255,179,71,0.10))",
            boxShadow: `0 0 ${26 + pulse * 12}px rgba(255,122,26,${pulse})`,
          }}
        >
          ▶
        </div>
      </div>
    </div>
  );
};

const WorkflowGrid: React.FC<{ sceneFrame: number; wide: boolean }> = ({ sceneFrame, wide }) => (
  <div
    style={{
      marginTop: wide ? 32 : 28,
      display: "grid",
      gridTemplateColumns: wide ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
      gap: wide ? 16 : 14,
    }}
  >
    {workflow.map((item, i) => (
      <div
        key={item.step}
        style={{
          ...enterStyle(sceneFrame, 16 + i * 6, 16),
          minHeight: wide ? 230 : 190,
          padding: wide ? 19 : 16,
          borderRadius: 18,
          border: `1px solid ${i === 0 ? "rgba(255,179,71,0.42)" : c.line}`,
          background: `linear-gradient(180deg, rgba(255,122,26,${i === 0 ? 0.105 : 0.055}), rgba(255,240,223,0.025))`,
          boxShadow: "0 0 22px rgba(255,122,26,0.10)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", color: c.orange2, fontSize: 13, fontWeight: 950 }}>
          <span>Bước {item.step}</span>
          <span>{item.tag}</span>
        </div>
        <div style={{ marginTop: 24, fontSize: wide ? 32 : 28 }}>{item.icon}</div>
        <div style={{ marginTop: 14, color: c.cream, fontWeight: 950, fontSize: wide ? 25 : 21, lineHeight: 1.05 }}>{item.title}</div>
        <div style={{ marginTop: 10, color: c.muted, fontSize: wide ? 15 : 13, lineHeight: 1.28, fontWeight: 650 }}>{item.body}</div>
      </div>
    ))}
  </div>
);

const ResultBars: React.FC<{ sceneFrame: number; wide: boolean }> = ({ sceneFrame, wide }) => (
  <div style={{ marginTop: wide ? 34 : 28, display: "grid", gap: wide ? 15 : 13 }}>
    {[
      ["2 ngày → 1 ngày", "Nhanh hơn với workflow rõ"],
      ["1-2 giờ+", "Tiết kiệm ở phần motion/B-roll"],
      ["Control", "Người làm nội dung giữ tiêu chuẩn"],
    ].map(([big, small], i) => (
      <div
        key={big}
        style={{
          ...enterStyle(sceneFrame, 16 + i * 7, 16),
          padding: wide ? "18px 20px" : "16px 18px",
          borderRadius: 14,
          border: `1px solid ${c.line}`,
          background: "linear-gradient(90deg, rgba(255,122,26,0.18), rgba(255,240,223,0.045))",
        }}
      >
        <div style={{ color: c.orange2, fontWeight: 950, fontSize: wide ? 30 : 25 }}>{big}</div>
        <div style={{ color: c.muted, marginTop: 5, fontWeight: 700, fontSize: wide ? 17 : 15 }}>{small}</div>
      </div>
    ))}
  </div>
);

const StageContent: React.FC<{ wide: boolean }> = ({ wide }) => {
  const frame = useCurrentFrame();
  const scene = scenes.find((s) => frame >= s.from * fps && frame < s.to * fps) ?? scenes[scenes.length - 1];
  const sceneFrame = frame - scene.from * fps;
  const mode = scene.mode;
  const compact = !wide;
  return (
    <Shell wide={wide} sceneFrame={sceneFrame}>
      <Header scene={scene} sceneFrame={sceneFrame} />
      <TitleBlock scene={scene} sceneFrame={sceneFrame} wide={wide} />
      {mode === "workflow" ? (
        <WorkflowGrid sceneFrame={sceneFrame} wide={wide} />
      ) : mode === "result" ? (
        <ResultBars sceneFrame={sceneFrame} wide={wide} />
      ) : (
        <div style={{ marginTop: wide ? 28 : 24, display: "grid", gap: wide ? 14 : 12 }}>
          {(bulletsByMode[mode] ?? bulletsByMode.hero).map((item, i) => (
            <InfoCard key={item.title} item={item} delay={16 + i * 7} sceneFrame={sceneFrame} compact={compact} />
          ))}
        </div>
      )}
      {mode === "hero" || mode === "html" ? <OutputMock sceneFrame={sceneFrame} wide={wide} /> : null}
      {mode === "problem" ? (
        <div style={{ marginTop: wide ? 22 : 18, display: "grid", gap: 10 }}>
          {["Viết kịch bản", "Quay / thu âm", "Dựng B-roll", "Đóng gói"].map((t, i) => (
            <InfoCard
              key={t}
              item={{ icon: `${i + 1}`, title: t, body: i === 2 ? "Phần tốn công nhất nếu làm thủ công." : "Một mắt xích trong workflow solo creator." }}
              delay={38 + i * 5}
              sceneFrame={sceneFrame}
              compact
            />
          ))}
        </div>
      ) : null}
    </Shell>
  );
};

const PresenterFrame: React.FC<{ variant: "wide" | "verticalLarge" | "pip" }> = ({ variant }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame, fps, config: { damping: 20, stiffness: 95 } });
  const map: Record<typeof variant, React.CSSProperties> = {
    wide: { width: 470, height: 836, borderRadius: 26 },
    verticalLarge: { width: 838, height: 628, borderRadius: 28 },
    pip: { width: 386, height: 686, borderRadius: 24 },
  };
  return (
    <div
      style={{
        ...map[variant],
        position: "relative",
        overflow: "hidden",
        border: "2px solid rgba(255,139,38,0.64)",
        background: c.panel,
        boxShadow: "0 0 34px rgba(255,122,26,0.26), 0 28px 80px rgba(0,0,0,0.52)",
        transform: `scale(${0.97 + p * 0.03})`,
      }}
    >
      <OffthreadVideo
        src={presenterSrc}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: variant === "wide" ? "52% 50%" : "50% 43%",
          filter: "saturate(1.06) contrast(1.03) brightness(1.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 38px rgba(255,122,26,0.18)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 6, background: "rgba(255,139,38,0.10)" }}>
      <div
        style={{
          height: "100%",
          width: `${(frame / durationInFrames) * 100}%`,
          background: `linear-gradient(90deg, ${c.orange}, ${c.orange2})`,
          boxShadow: "0 0 18px rgba(255,122,26,0.55)",
        }}
      />
    </div>
  );
};

const WideComposition: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font, color: c.ink }}>
    <Background />
    <div style={{ position: "absolute", left: 56, top: 60, width: 1230, height: 960 }}>
      <StageContent wide />
    </div>
    <div style={{ position: "absolute", right: 84, top: 102 }}>
      <PresenterFrame variant="wide" />
    </div>
    <Progress />
  </AbsoluteFill>
);

const VerticalComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = scenes.find((s) => frame >= s.from * fps && frame < s.to * fps) ?? scenes[scenes.length - 1];
  const large = scene.mode === "hero";
  return (
    <AbsoluteFill style={{ fontFamily: font, color: c.ink }}>
      <Background />
      <div style={{ position: "absolute", left: 48, top: 68, width: 984, height: large ? 1048 : 1115 }}>
        <StageContent wide={false} />
      </div>
      <div style={{ position: "absolute", left: large ? 121 : 624, bottom: large ? 120 : 78 }}>
        <PresenterFrame variant={large ? "verticalLarge" : "pip"} />
      </div>
      <Progress />
    </AbsoluteFill>
  );
};

const Root: React.FC = () => (
  <>
    <Composition id="HLFreeHtmlV3Wide" component={WideComposition} durationInFrames={durationInFrames} fps={fps} width={1920} height={1080} />
    <Composition id="HLFreeHtmlV3Vertical" component={VerticalComposition} durationInFrames={durationInFrames} fps={fps} width={1080} height={1920} />
  </>
);

registerRoot(Root);
