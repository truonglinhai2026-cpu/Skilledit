import { registerRoot } from "remotion";
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

type Bullet = {
  emoji: string;
  title: string;
  text: string;
};

type Step = {
  n: string;
  title: string;
  text: string;
  tag: string;
};

type Scene = {
  badge: string;
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  duration: number;
  bullets?: Bullet[];
  visual: "screen" | "workflow" | "compare" | "tools" | "metrics" | "quote";
  steps?: Step[];
};

const fps = 30;
const W = 1280;
const H = 720;

const scenes: Scene[] = [
  {
    badge: "Creative Lab by Hào Lâm",
    eyebrow: "HL Free · AI cho creator",
    title: <>Claude Tự <span style={{ color: "#ff7a1a" }}>Edit Video?</span></>,
    subtitle: "Hào thử một skill tạo B-roll bằng AI để xem nó có thật sự giúp creator tiết kiệm thời gian edit hay không.",
    duration: 7,
    visual: "screen",
    bullets: [
      { emoji: "🎬", title: "Review + tutorial nhẹ", text: "Không khoe tool suông, có quy trình để mọi người hình dung cách làm." },
      { emoji: "⚠️", title: "Không ảo tưởng AI làm hết", text: "AI tạo bản nháp nhanh, còn người làm nội dung vẫn giữ tiêu chuẩn." },
    ],
  },
  {
    badge: "1 · Vấn đề",
    eyebrow: "Creator solo rất dễ kiệt sức",
    title: <>Edit video đang ăn quá nhiều <span style={{ color: "#ff7a1a" }}>thời gian</span></>,
    visual: "workflow",
    duration: 8,
    bullets: [
      { emoji: "🧠", title: "Không chỉ có quay", text: "Một video còn có ý tưởng, kịch bản, thu âm, edit, thumbnail, SEO, đăng bài." },
      { emoji: "⏳", title: "Riêng edit đã rất nặng", text: "Càng nhiều minh họa, timeline càng phình ra và càng mất thời gian kiểm soát." },
      { emoji: "😵", title: "B-roll dễ bị xem nhẹ", text: "Nhưng chính nó làm video dễ hiểu, đỡ nhàm và giữ người xem tốt hơn." },
    ],
    steps: [
      { n: "1", title: "Viết kịch bản", text: "Ý tưởng, outline, lời thoại.", tag: "đầu vào" },
      { n: "2", title: "Quay / thu âm", text: "A-roll, voice, screen record.", tag: "sản xuất" },
      { n: "3", title: "Dựng B-roll", text: "Motion, text, highlight, minh họa.", tag: "tốn công" },
      { n: "4", title: "Đóng gói", text: "Thumbnail, title, SEO, đăng bài.", tag: "cuối" },
    ],
  },
  {
    badge: "2 · Điểm đau thật",
    eyebrow: "B-roll / motion minh họa",
    title: <>Hiệu ứng nhỏ, công sức <span style={{ color: "#ff7a1a" }}>không nhỏ</span></>,
    visual: "compare",
    duration: 8,
    bullets: [
      { emoji: "📌", title: "Text chạy, card, highlight UI", text: "Nhìn đơn giản nhưng dựng thủ công rất mất nhịp." },
      { emoji: "🧱", title: "Premiere làm được nhưng cực", text: "Motion tinh tế thường không phải điểm mạnh của workflow này." },
      { emoji: "🔥", title: "After Effects mạnh nhưng nặng", text: "Cần máy, kỹ năng và thời gian. Đây là chi phí lớn với creator solo." },
    ],
  },
  {
    badge: "3 · Giả thuyết",
    eyebrow: "Không tự động hóa 100%",
    title: <>Để AI tạo <span style={{ color: "#ff7a1a" }}>B-roll</span>, mình giữ quyền kiểm soát</>,
    visual: "workflow",
    duration: 8,
    bullets: [
      { emoji: "🎯", title: "Không phải AI làm hết", text: "Mục tiêu là giảm phần dựng minh họa lặp lại, tốn công." },
      { emoji: "🧩", title: "Remotion Skill như máy tạo scene", text: "Đưa yêu cầu, tạo component, render thành đoạn minh họa." },
      { emoji: "✅", title: "Không cần API trong hướng này", text: "Dùng như B-roll minh họa, không làm full video voice/sub/nhạc." },
    ],
    steps: [
      { n: "1", title: "Kịch bản", text: "Đoạn nào cần minh họa.", tag: "input" },
      { n: "2", title: "Claude Desktop", text: "Đọc yêu cầu và gọi skill.", tag: "agent" },
      { n: "3", title: "Remotion Skill", text: "Tạo scene, motion, card.", tag: "engine" },
      { n: "4", title: "B-roll output", text: "Xuất đoạn minh họa.", tag: "video" },
    ],
  },
  {
    badge: "4 · Cách thực thi",
    eyebrow: "Đơn giản ở bề mặt, cần kỹ ở chi tiết",
    title: <>Tải skill, trỏ thư mục, đưa <span style={{ color: "#ff7a1a" }}>kịch bản</span></>,
    visual: "screen",
    duration: 9,
    bullets: [
      { emoji: "📥", title: "Tải skill", text: "Skill 1 Hào chia sẻ; skill 2 của người khác thì hướng dẫn liên hệ đúng." },
      { emoji: "📁", title: "Trỏ đúng thư mục", text: "Sai folder là AI dễ không thấy file hoặc lưu output sai chỗ." },
      { emoji: "✍️", title: "Đưa yêu cầu rõ", text: "Nói đoạn này minh họa gì, tone màu ra sao, output để đâu." },
      { emoji: "🎞️", title: "Xuất và kiểm lại", text: "Không nhận output mù quáng. Xem, sửa, rồi render lại." },
    ],
  },
  {
    badge: "5 · Kết quả lần đầu",
    eyebrow: "Chưa đẹp là bình thường",
    title: <>Output đầu tiên có thể <span style={{ color: "#ff7a1a" }}>xấu</span> 😅</>,
    visual: "compare",
    duration: 8,
    bullets: [
      { emoji: "🎨", title: "Màu có thể lệch", text: "AI chưa hiểu hệ nhận diện hoặc style mình muốn." },
      { emoji: "📐", title: "Bố cục có thể cứng", text: "Template mẫu hạn chế thì output cũng hạn chế." },
      { emoji: "🌀", title: "Motion có thể chưa đúng nhịp", text: "Đây là lúc mình cần đọc lại và sửa yêu cầu." },
    ],
  },
  {
    badge: "6 · So sánh trải nghiệm",
    eyebrow: "Đánh giá cá nhân",
    title: <>Tool đắt hơn thường nhanh hơn, nhưng <span style={{ color: "#ff7a1a" }}>không tự đẹp</span></>,
    subtitle: "Claude/Codex thường hiểu ý tốt hơn. Antigravity rẻ và dễ tiếp cận hơn, vẫn đáng thử nếu người dùng biết điều khiển.",
    visual: "tools",
    duration: 8,
  },
  {
    badge: "7 · Insight chính",
    eyebrow: "Template là phần quyết định",
    title: <>Vấn đề không chỉ nằm ở <span style={{ color: "#ff7a1a" }}>AI</span></>,
    visual: "workflow",
    duration: 9,
    bullets: [
      { emoji: "🧱", title: "Template quyết định nền chất lượng", text: "Font, màu, khoảng cách, motion, style card phải có hệ." },
      { emoji: "🗣️", title: "Prompt phải rõ từng cảnh", text: "Nền gì, text mấy chữ, nhịp chuyển ra sao, output ở đâu." },
      { emoji: "👀", title: "Phải đọc kỹ AI đang nói gì", text: "AI hỏi, cảnh báo, báo lỗi... đều là tín hiệu để cải tiến." },
    ],
    steps: [
      { n: "1", title: "Đọc kỹ", text: "AI đang hỏi gì, làm gì, báo gì?", tag: "quan sát" },
      { n: "2", title: "Chỉ rõ", text: "Màu, layout, motion, text, output.", tag: "điều khiển" },
      { n: "3", title: "Sửa từng vòng", text: "Không sửa mọi thứ một lần.", tag: "cải tiến" },
      { n: "4", title: "Giữ template", text: "Có hệ thì output mới ổn định.", tag: "scale" },
    ],
  },
  {
    badge: "8 · Kết quả kỳ vọng",
    eyebrow: "Thực tế, không ảo tưởng",
    title: <>Tiết kiệm thời gian, vẫn giữ <span style={{ color: "#ff7a1a" }}>control</span></>,
    visual: "metrics",
    duration: 8,
    bullets: [
      { emoji: "⏱️", title: "Ít nhất 1-2 giờ", text: "Với người biết edit, con số này còn khá khiêm tốn." },
      { emoji: "📆", title: "2 ngày xuống 1 ngày", text: "Video nhiều minh họa có thể giảm rất mạnh thời gian." },
      { emoji: "🎛️", title: "Không mất quyền kiểm soát", text: "Hào vẫn quyết định nhịp, cảnh và template phù hợp." },
    ],
  },
  {
    badge: "9 · Bài học",
    eyebrow: "Đừng giao hết rồi cầu may",
    title: <>Dùng AI như một <span style={{ color: "#ff7a1a" }}>phụ tá tạo bản nháp nhanh</span></>,
    visual: "quote",
    duration: 7,
    bullets: [
      { emoji: "📖", title: "Đọc kỹ", text: "Đừng lướt qua những gì AI nói." },
      { emoji: "🎯", title: "Chỉ rõ", text: "Muốn đẹp kiểu nào, dùng cho đoạn nào, output ra sao." },
      { emoji: "🧪", title: "Thử và sửa", text: "Không kỳ vọng lần đầu hoàn hảo." },
    ],
  },
  {
    badge: "10 · Tài nguyên & CTA",
    eyebrow: "HL Free · mục tiêu 30K sub",
    title: <>Muốn Hào hướng dẫn <span style={{ color: "#ff7a1a" }}>chi tiết hơn?</span></>,
    visual: "metrics",
    duration: 7,
    bullets: [
      { emoji: "🔗", title: "Link tài nguyên gắn sau", text: "Skill 1 chia sẻ được; skill 2 thì hướng dẫn liên hệ đúng." },
      { emoji: "💬", title: "Cứ để lại bình luận", text: "Hào đọc hết, không cần comment từ khóa máy móc." },
      { emoji: "⭐", title: "3-5 bình luận nhiều like", text: "Hào sẽ chọn để trả lời trong video sau." },
    ],
  },
];

const totalFrames = scenes.reduce((sum, scene) => sum + Math.round(scene.duration * fps), 0);

const colors = {
  bg: "#100b08",
  bg2: "#1a110b",
  panel: "#24170f",
  panel2: "#2d1c11",
  ink: "#fff3e6",
  muted: "#d2b8a2",
  soft: "#9b7b66",
  line: "rgba(255,139,38,0.25)",
  orange: "#ff7a1a",
  orange2: "#ffb347",
  cream: "#fff0df",
};

const fontBody = `"Segoe UI Variable Text", "Segoe UI", Arial, sans-serif`;
const fontDisplay = `Bahnschrift, "Segoe UI Variable Display", "Segoe UI", Arial, sans-serif`;

const ease = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${colors.bg2}, ${colors.bg})`, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: "-25%",
          background: `radial-gradient(circle at ${50 + Math.sin(t / 6) * 5}% ${8 + Math.cos(t / 7) * 3}%, rgba(255,122,26,0.20), transparent 28%),
          radial-gradient(circle at ${16 + Math.cos(t / 5) * 3}% ${28 + Math.sin(t / 6) * 5}%, rgba(255,179,71,0.12), transparent 24%),
          radial-gradient(circle at ${78 + Math.sin(t / 8) * 4}% ${86 + Math.cos(t / 7) * 2}%, rgba(255,122,26,0.10), transparent 25%)`,
          filter: "blur(1px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "-10%",
          backgroundImage:
            "linear-gradient(rgba(255,139,38,0.052) 1px, transparent 1px), linear-gradient(90deg, rgba(255,139,38,0.052) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          transform: `translate(${(frame % 180) * 0.16}px, ${(frame % 180) * 0.16}px)`,
          opacity: 0.55,
        }}
      />
    </AbsoluteFill>
  );
};

const AudioBed: React.FC = () => {
  const offsets: number[] = [];
  scenes.reduce((acc, scene) => {
    offsets.push(acc);
    return acc + Math.round(scene.duration * fps);
  }, 0);

  return (
    <>
      <Audio src={staticFile("hao-broll/music.mp3")} volume={0.055} loop />
      {offsets.map((from, i) => (
        <Sequence key={`whoosh-${i}`} from={from}>
          <Audio src={staticFile(i === 0 ? "hao-broll/soft-boom.wav" : "hao-broll/soft-whoosh.wav")} volume={i === 0 ? 0.18 : 0.12} />
        </Sequence>
      ))}
      {offsets.flatMap((from, i) => [24, 42, 60, 78].slice(0, i === 0 ? 2 : 4).map((delta, j) => (
        <Sequence key={`pop-${i}-${j}`} from={from + delta}>
          <Audio src={staticFile(j % 2 === 0 ? "hao-broll/card-pop.wav" : "hao-broll/tick.wav")} volume={0.11} />
        </Sequence>
      )))}
    </>
  );
};

const BulletView: React.FC<{ bullet: Bullet; index: number }> = ({ bullet, index }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: frame - 14 - index * 8, fps, config: { damping: 16, stiffness: 120 } });
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "42px 1fr",
        gap: 12,
        alignItems: "start",
        padding: "12px 14px",
        border: `1px solid ${colors.line}`,
        borderRadius: 14,
        background: "rgba(255,240,223,0.058)",
        opacity: p,
        transform: `translateY(${(1 - p) * 18}px)`,
      }}
    >
      <div style={{ width: 42, height: 42, display: "grid", placeItems: "center", borderRadius: 12, background: "rgba(255,122,26,0.14)", border: `1px solid ${colors.line}`, fontSize: 22 }}>
        {bullet.emoji}
      </div>
      <div>
        <div style={{ color: colors.cream, fontWeight: 850, fontSize: 21, lineHeight: 1.2 }}>{bullet.title}</div>
        <div style={{ color: colors.muted, fontSize: 15.5, lineHeight: 1.35, marginTop: 4 }}>{bullet.text}</div>
      </div>
    </div>
  );
};

const WorkflowVisual: React.FC<{ steps?: Step[] }> = ({ steps }) => {
  const frame = useCurrentFrame();
  const list = steps ?? [
    { n: "1", title: "Viết kịch bản", text: "Ý tưởng, outline, lời thoại.", tag: "đầu vào" },
    { n: "2", title: "Quay / thu âm", text: "A-roll, voice, screen record.", tag: "sản xuất" },
    { n: "3", title: "Dựng B-roll", text: "Motion, text, highlight.", tag: "tốn công" },
    { n: "4", title: "Đóng gói", text: "Thumbnail, title, SEO.", tag: "cuối" },
  ];
  return (
    <div style={visualWrap}>
      <MiniTitle left="Workflow" right="structured" />
      <div style={{ display: "grid", gap: 12, position: "relative", zIndex: 1 }}>
        {list.map((step, idx) => {
          const p = spring({ frame: frame - 12 - idx * 7, fps, config: { damping: 17, stiffness: 120 } });
          return (
            <div key={step.n} style={{ ...stepStyle, opacity: p, transform: `translateX(${(1 - p) * 24}px)` }}>
              <div style={numStyle}>{step.n}</div>
              <div>
                <div style={{ color: colors.cream, fontWeight: 880, fontSize: 21 }}>{step.title}</div>
                <div style={{ color: colors.muted, fontSize: 15 }}>{step.text}</div>
              </div>
              <div style={statusStyle}>{step.tag}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MiniTitle: React.FC<{ left: string; right: string }> = ({ left, right }) => (
  <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", color: colors.muted, fontWeight: 850, fontSize: 15, marginBottom: 16 }}>
    <span>{left}</span>
    <span style={statusStyle}>{right}</span>
  </div>
);

const ScreenVisual: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={visualWrap}>
      <MiniTitle left="Claude / Remotion output" right="B-roll" />
      <div style={{ position: "relative", zIndex: 1, minHeight: 304, border: `1px solid ${colors.line}`, borderRadius: 18, background: "#0d0907", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.28)" }}>
        <div style={{ height: 42, display: "flex", alignItems: "center", gap: 8, padding: "0 16px", borderBottom: `1px solid ${colors.line}`, background: "rgba(255,240,223,0.04)" }}>
          {[0, 1, 2].map((i) => <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: colors.orange, opacity: 0.85 }} />)}
        </div>
        <div style={{ padding: 24, display: "grid", gap: 13 }}>
          {[0.78, 0.88, 0.55, 0.72, 0.46].map((w, i) => {
            const glow = interpolate(Math.sin((frame + i * 8) / 18), [-1, 1], [0.45, 1]);
            return <div key={i} style={{ width: `${w * 100}%`, height: 17, borderRadius: 999, background: `rgba(255,240,223,${0.1 + glow * 0.08})` }} />;
          })}
        </div>
        <div style={{ position: "absolute", right: 24, bottom: 24, width: 238, height: 134, borderRadius: 16, border: `1px solid ${colors.line}`, background: "linear-gradient(135deg, rgba(255,122,26,0.36), rgba(255,179,71,0.10))", display: "grid", placeItems: "center", transform: `translateY(${Math.sin(frame / 18) * 6}px)` }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", display: "grid", placeItems: "center", background: colors.cream, color: colors.orange, fontSize: 26, paddingLeft: 4 }}>▶</div>
        </div>
      </div>
    </div>
  );
};

const CompareVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const p = ease(frame, 10, 24);
  return (
    <div style={visualWrap}>
      <MiniTitle left="Before / after" right="test thật" />
      <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, height: "calc(100% - 42px)" }}>
        {[
          ["😵", "Làm tay", "Timeline nhiều lớp, sửa từng keyframe, rất dễ mất thời gian."],
          ["✨", "Có AI hỗ trợ", "Tạo bản nháp minh họa nhanh hơn, còn mình chỉnh phần quan trọng."],
        ].map(([emoji, title, text], idx) => (
          <div key={title} style={{ ...compareCard, opacity: p, transform: `translateY(${(1 - p) * (idx ? 18 : 28)}px)` }}>
            <div style={faceStyle}>{emoji}</div>
            <strong style={{ color: colors.cream, fontSize: 30 }}>{title}</strong>
            <span style={{ color: colors.muted, fontSize: 17, lineHeight: 1.35 }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ToolsVisual: React.FC = () => (
  <div style={{ ...visualWrap, minHeight: 360 }}>
    <MiniTitle left="Tool experience" right="cá nhân" />
    <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
      {[
        ["Hiểu ý tốt", "Claude", "Hợp để agent đọc yêu cầu, tạo cấu trúc và sửa theo phản hồi nhanh."],
        ["Mạnh phần code", "Codex", "Hợp khi cần kiểm soát cấu trúc, file, template và logic output kỹ hơn."],
        ["Rẻ, dễ tiếp cận", "Antigravity", "Chạy được, output có thể xấu hơn, nhưng là lựa chọn tốt nếu biết control."],
      ].map(([label, title, text], idx) => <ToolCard key={title} label={label} title={title} text={text} index={idx} />)}
    </div>
  </div>
);

const ToolCard: React.FC<{ label: string; title: string; text: string; index: number }> = ({ label, title, text, index }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: frame - 14 - index * 8, fps, config: { damping: 16, stiffness: 120 } });
  return (
    <div style={{ border: `1px solid ${colors.line}`, borderRadius: 18, background: "rgba(255,240,223,0.065)", padding: 20, minHeight: 244, display: "grid", alignContent: "space-between", opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
      <div style={{ ...statusStyle, width: "fit-content", color: "#170d07", background: colors.orange2 }}>{label}</div>
      <div style={{ color: colors.cream, fontSize: 30, fontWeight: 900 }}>{title}</div>
      <div style={{ color: colors.muted, fontSize: 16, lineHeight: 1.36 }}>{text}</div>
    </div>
  );
};

const MetricsVisual: React.FC = () => (
  <div style={visualWrap}>
    <MiniTitle left="Kết quả mong muốn" right="creator workflow" />
    <div style={{ display: "grid", gap: 16, position: "relative", zIndex: 1 }}>
      {[
        ["2 ngày → 1 ngày", "Với video nhiều B-roll minh họa nếu workflow đủ tốt."],
        ["1-2 giờ+", "Thời gian tiết kiệm thực tế khi dùng thành thạo."],
        ["Control", "AI tạo bản nháp, mình giữ tiêu chuẩn cuối."],
      ].map(([big, text], idx) => <Metric key={big} big={big} text={text} index={idx} />)}
    </div>
  </div>
);

const Metric: React.FC<{ big: string; text: string; index: number }> = ({ big, text, index }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: frame - 12 - index * 8, fps, config: { damping: 16, stiffness: 110 } });
  return (
    <div style={{ padding: 20, borderRadius: 16, background: "rgba(255,122,26,0.12)", border: "1px solid rgba(255,122,26,0.34)", opacity: p, transform: `scale(${0.96 + p * 0.04})` }}>
      <div style={{ color: colors.orange2, fontSize: 45, fontWeight: 950, lineHeight: 1 }}>{big}</div>
      <div style={{ color: colors.muted, fontSize: 17, lineHeight: 1.35, marginTop: 6 }}>{text}</div>
    </div>
  );
};

const QuoteVisual: React.FC = () => (
  <div style={{ ...visualWrap, display: "grid", placeItems: "center" }}>
    <div style={{ color: colors.cream, fontWeight: 950, fontSize: 48, lineHeight: 1.12, textAlign: "center", position: "relative", zIndex: 1 }}>
      AI là phụ tá tạo bản nháp nhanh.
      <br />
      <span style={{ color: colors.orange }}>Mình giữ tiêu chuẩn.</span>
    </div>
  </div>
);

const visualWrap: React.CSSProperties = {
  position: "relative",
  minHeight: 430,
  border: `1px solid ${colors.line}`,
  borderRadius: 18,
  background: "rgba(12,8,5,0.38)",
  padding: 22,
  overflow: "hidden",
};

const stepStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "52px 1fr auto",
  alignItems: "center",
  gap: 14,
  padding: 14,
  borderRadius: 15,
  border: `1px solid ${colors.line}`,
  background: "rgba(255,240,223,0.06)",
};

const numStyle: React.CSSProperties = {
  width: 50,
  height: 50,
  display: "grid",
  placeItems: "center",
  borderRadius: 14,
  color: "#170d07",
  background: `linear-gradient(135deg, ${colors.orange}, ${colors.orange2})`,
  fontSize: 22,
  fontWeight: 950,
};

const statusStyle: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 999,
  color: colors.orange2,
  background: "rgba(255,122,26,0.12)",
  border: `1px solid ${colors.line}`,
  fontWeight: 900,
  fontSize: 12,
};

const compareCard: React.CSSProperties = {
  display: "grid",
  alignContent: "center",
  justifyItems: "center",
  textAlign: "center",
  gap: 12,
  border: `1px solid ${colors.line}`,
  borderRadius: 18,
  background: "rgba(255,240,223,0.06)",
  padding: 22,
};

const faceStyle: React.CSSProperties = {
  width: 96,
  height: 96,
  display: "grid",
  placeItems: "center",
  borderRadius: "50%",
  fontSize: 50,
  background: "rgba(255,122,26,0.14)",
  border: `1px solid ${colors.line}`,
};

const getVisual = (scene: Scene): React.ReactNode => {
  if (scene.visual === "screen") return <ScreenVisual />;
  if (scene.visual === "workflow") return <WorkflowVisual steps={scene.steps} />;
  if (scene.visual === "compare") return <CompareVisual />;
  if (scene.visual === "tools") return <ToolsVisual />;
  if (scene.visual === "metrics") return <MetricsVisual />;
  return <QuoteVisual />;
};

const SceneView: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const slide = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const shine = ease(frame, 8, 26);
  const titleY = (1 - slide) * 24;
  const visual = getVisual(scene);

  return (
    <AbsoluteFill style={{ padding: 26, fontFamily: fontBody }}>
      <Background />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "100%",
          padding: "38px 48px",
          border: `1px solid ${colors.line}`,
          borderRadius: 18,
          overflow: "hidden",
          background: "linear-gradient(145deg, rgba(45,28,17,0.97), rgba(21,13,9,0.98))",
          boxShadow: "0 34px 80px rgba(0,0,0,0.42)",
          opacity: slide,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.05) 45%, transparent 60%)",
            transform: `translateX(${interpolate(shine, [0, 1], [-130, 130])}%)`,
            opacity: shine < 0.98 ? Math.sin(shine * Math.PI) : 0,
          }}
        />
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "grid", gridTemplateRows: "auto 1fr", gap: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: colors.muted, fontWeight: 850, fontSize: 17 }}>
            <span style={{ color: colors.orange2, border: `1px solid ${colors.line}`, background: "rgba(255,122,26,0.12)", borderRadius: 999, padding: "8px 14px", fontWeight: 950 }}>{scene.badge}</span>
            <span>{scene.eyebrow}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: scene.visual === "tools" || scene.visual === "quote" ? "1fr" : "1.02fr 0.98fr", gap: 30, alignItems: "center", minHeight: 0 }}>
            <div>
              <div style={{ color: colors.cream, fontFamily: fontDisplay, fontWeight: 850, fontSize: scene.visual === "quote" ? 54 : 56, lineHeight: 1.04, letterSpacing: 0, maxWidth: 780 }}>
                {scene.title}
              </div>
              {scene.subtitle ? <div style={{ color: colors.muted, fontSize: 22, lineHeight: 1.34, marginTop: 18, maxWidth: 740 }}>{scene.subtitle}</div> : null}
              {scene.bullets ? (
                <div style={{ display: "grid", gap: 12, marginTop: 22 }}>
                  {scene.bullets.map((b, i) => <BulletView key={b.title} bullet={b} index={i} />)}
                </div>
              ) : null}
            </div>
            {scene.visual === "tools" || scene.visual === "quote" ? null : visual}
            {scene.visual === "tools" || scene.visual === "quote" ? <div style={{ marginTop: 18 }}>{visual}</div> : null}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PortraitBullet: React.FC<{ bullet: Bullet; index: number }> = ({ bullet, index }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: frame - 14 - index * 8, fps, config: { damping: 16, stiffness: 120 } });
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "58px 1fr",
        gap: 18,
        alignItems: "center",
        padding: "20px 22px",
        borderRadius: 20,
        border: `1px solid ${colors.line}`,
        background: "rgba(255,240,223,0.06)",
        opacity: p,
        transform: `translateY(${(1 - p) * 22}px)`,
      }}
    >
      <div style={{ width: 58, height: 58, display: "grid", placeItems: "center", borderRadius: 16, background: "rgba(255,122,26,0.14)", border: `1px solid ${colors.line}`, fontSize: 28 }}>
        {bullet.emoji}
      </div>
      <div>
        <div style={{ color: colors.cream, fontFamily: fontDisplay, fontWeight: 800, fontSize: 29, lineHeight: 1.15 }}>{bullet.title}</div>
        <div style={{ color: colors.muted, fontSize: 22, lineHeight: 1.32, marginTop: 6 }}>{bullet.text}</div>
      </div>
    </div>
  );
};

const SceneViewPortrait: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const slide = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const shine = ease(frame, 8, 26);
  const titleY = (1 - slide) * 32;
  const visual = getVisual(scene);

  return (
    <AbsoluteFill style={{ padding: 38, fontFamily: fontBody }}>
      <Background />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "100%",
          padding: "52px 48px",
          border: `1px solid ${colors.line}`,
          borderRadius: 28,
          overflow: "hidden",
          background: "linear-gradient(145deg, rgba(45,28,17,0.97), rgba(21,13,9,0.98))",
          boxShadow: "0 42px 100px rgba(0,0,0,0.45)",
          opacity: slide,
          transform: `translateY(${titleY}px)`,
          display: "grid",
          gridTemplateRows: "auto auto auto 1fr",
          gap: 26,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.05) 45%, transparent 60%)",
            transform: `translateX(${interpolate(shine, [0, 1], [-130, 130])}%)`,
            opacity: shine < 0.98 ? Math.sin(shine * Math.PI) : 0,
          }}
        />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, color: colors.muted, fontWeight: 850, fontSize: 22 }}>
          <span style={{ color: colors.orange2, border: `1px solid ${colors.line}`, background: "rgba(255,122,26,0.12)", borderRadius: 999, padding: "10px 16px", fontWeight: 950 }}>{scene.badge}</span>
          <span style={{ textAlign: "right" }}>{scene.eyebrow}</span>
        </div>
        <div style={{ position: "relative", zIndex: 1, color: colors.cream, fontFamily: fontDisplay, fontWeight: 850, fontSize: scene.visual === "quote" ? 74 : 70, lineHeight: 1.02, letterSpacing: 0 }}>
          {scene.title}
        </div>
        {scene.subtitle ? <div style={{ position: "relative", zIndex: 1, color: colors.muted, fontSize: 28, lineHeight: 1.32 }}>{scene.subtitle}</div> : null}
        <div style={{ position: "relative", zIndex: 1, display: "grid", alignContent: "start", gap: 22, minHeight: 0 }}>
          {scene.bullets ? (
            <div style={{ display: "grid", gap: 16 }}>
              {scene.bullets.slice(0, 3).map((b, i) => <PortraitBullet key={b.title} bullet={b} index={i} />)}
            </div>
          ) : null}
          <div style={{ marginTop: scene.bullets ? 6 : 0 }}>
            {visual}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const BrollDeck: React.FC<{ withSound?: boolean }> = ({ withSound = true }) => {
  let cursor = 0;
  return (
    <AbsoluteFill>
      {withSound ? <AudioBed /> : null}
      {scenes.map((scene, idx) => {
        const from = cursor;
        const durationInFrames = Math.round(scene.duration * fps);
        cursor += durationInFrames;
        return (
          <Sequence key={`${idx}-${scene.badge}`} from={from} durationInFrames={durationInFrames}>
            <SceneView scene={scene} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const BrollDeck1080: React.FC<{ withSound?: boolean }> = ({ withSound = true }) => (
  <AbsoluteFill style={{ background: colors.bg, overflow: "hidden" }}>
    <div style={{ width: W, height: H, zoom: 1.5 }}>
      <BrollDeck withSound={withSound} />
    </div>
  </AbsoluteFill>
);

const BrollDeckPortrait: React.FC<{ withSound?: boolean }> = ({ withSound = true }) => {
  let cursor = 0;
  return (
    <AbsoluteFill>
      {withSound ? <AudioBed /> : null}
      {scenes.map((scene, idx) => {
        const from = cursor;
        const durationInFrames = Math.round(scene.duration * fps);
        cursor += durationInFrames;
        return (
          <Sequence key={`portrait-${idx}-${scene.badge}`} from={from} durationInFrames={durationInFrames}>
            <SceneViewPortrait scene={scene} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const Root: React.FC = () => (
  <>
    <Composition id="HaoBrollPreview" component={BrollDeck} durationInFrames={totalFrames} fps={fps} width={W} height={H} defaultProps={{ withSound: true }} />
    <Composition id="HaoBrollNoSound" component={BrollDeck} durationInFrames={totalFrames} fps={fps} width={W} height={H} defaultProps={{ withSound: false }} />
    <Composition id="HaoBrollFinal1080" component={BrollDeck1080} durationInFrames={totalFrames} fps={fps} width={1920} height={1080} defaultProps={{ withSound: true }} />
    <Composition id="HaoBrollVertical1080" component={BrollDeckPortrait} durationInFrames={totalFrames} fps={fps} width={1080} height={1920} defaultProps={{ withSound: true }} />
  </>
);

registerRoot(Root);
