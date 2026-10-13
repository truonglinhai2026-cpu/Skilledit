import { createContext, useContext, type ReactNode } from "react";

export type ThemePreset = "legacy-lime" | "dark-tech" | "light-minimal" | "warm-story" | "henry-brand";
export type GraphicsThemeConfig = {
  preset?: ThemePreset;
  backgroundStyle?: "solid" | "gradient" | "grid";
  accent?: string;
  background?: string;
  fontFamily?: string;
  cardStyle?: "rounded" | "square" | "pill";
  motion?: "gentle" | "balanced" | "energetic";
};
export type GraphicsThemeInput = ThemePreset | GraphicsThemeConfig;
export type GraphicsTheme = {
  preset: ThemePreset; background: string; backgroundEnd: string;
  surface: string; surfaceRaised: string; text: string; muted: string;
  accent: string; onAccent: string; card: string; cardEnd: string; cardText: string;
  border: string; fontFamily: string; backgroundStyle: "solid" | "gradient" | "grid";
  radius: number; motionFactor: number;
};

const base = {
  backgroundStyle: "gradient" as const, fontFamily: "Arial, sans-serif",
  radius: 18, motionFactor: 0.65,
};
export const GRAPHICS_THEMES: Record<ThemePreset, GraphicsTheme> = {
  "legacy-lime": { ...base, preset: "legacy-lime", background: "#0F121A", backgroundEnd: "#1E2434",
    surface: "#2A334A", surfaceRaised: "#343E5B", text: "#FFFFFF", muted: "#A5B4CB",
    accent: "#CFFF05", onAccent: "#0F121A", card: "#FFFFFF", cardEnd: "#E6EBF4", cardText: "#161B26",
    border: "#59657F", fontFamily: "Space Grotesk, Arial, sans-serif", backgroundStyle: "grid", motionFactor: 1 },
  "dark-tech": { ...base, preset: "dark-tech", background: "#101A2C", backgroundEnd: "#192E46",
    surface: "#203750", surfaceRaised: "#294763", text: "#F4F8FF", muted: "#B8CBDD",
    accent: "#65D6FF", onAccent: "#082031", card: "#203750", cardEnd: "#294763", cardText: "#F4F8FF", border: "#4C7290" },
  "light-minimal": { ...base, preset: "light-minimal", background: "#F5F7FB", backgroundEnd: "#E8EDF6",
    surface: "#FFFFFF", surfaceRaised: "#EEF2F8", text: "#18263D", muted: "#53627A",
    accent: "#2855D9", onAccent: "#FFFFFF", card: "#FFFFFF", cardEnd: "#EEF2F8", cardText: "#18263D", border: "#CCD5E4", backgroundStyle: "solid", radius: 12 },
  "warm-story": { ...base, preset: "warm-story", background: "#FAF1E7", backgroundEnd: "#EEDBC6",
    surface: "#FFF9F1", surfaceRaised: "#F3E3D2", text: "#3E291F", muted: "#755645",
    accent: "#B84A27", onAccent: "#FFFFFF", card: "#FFF9F1", cardEnd: "#F3E3D2", cardText: "#3E291F", border: "#D5B99F", radius: 24 },
  "henry-brand": { ...base, preset: "henry-brand", background: "#17191F", backgroundEnd: "#292C35",
    surface: "#30343F", surfaceRaised: "#3D4350", text: "#FFFFFF", muted: "#C1C7D2",
    accent: "#FFE600", onAccent: "#191A20", card: "#FFFFFF", cardEnd: "#EEF0F4", cardText: "#191A20", border: "#5D6575", backgroundStyle: "solid" },
};

export const rgba = (hex: string, alpha: number): string => {
  const v = hex.replace("#", "");
  return `rgba(${parseInt(v.slice(0, 2), 16)},${parseInt(v.slice(2, 4), 16)},${parseInt(v.slice(4, 6), 16)},${alpha})`;
};
const luminance = (hex: string): number => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((x) => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
  return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
};
const readableInk = (hex: string): string => luminance(hex) > 0.179 ? "#000000" : "#FFFFFF";

export const resolveGraphicsTheme = (input?: GraphicsThemeInput): GraphicsTheme => {
  const config = typeof input === "string" ? { preset: input } : input ?? {};
  const preset = config.preset ?? "legacy-lime";
  if (!Object.prototype.hasOwnProperty.call(GRAPHICS_THEMES, preset)) throw new Error(`Unknown graphics theme: ${preset}`);
  for (const color of [config.accent, config.background]) {
    if (color && !/^#[0-9a-f]{6}$/i.test(color)) throw new Error(`Use a six-digit hex color: ${color}`);
  }
  const enums = { backgroundStyle: ["solid", "gradient", "grid"], cardStyle: ["rounded", "square", "pill"], motion: ["gentle", "balanced", "energetic"] };
  for (const key of Object.keys(enums) as Array<keyof typeof enums>) {
    if (config[key] !== undefined && !enums[key].includes(config[key]!)) throw new Error(`Invalid graphics ${key}: ${config[key]}`);
  }
  const t = { ...GRAPHICS_THEMES[preset] };
  if (config.accent) { t.accent = config.accent; t.onAccent = readableInk(t.accent); }
  if (config.background) {
    t.background = config.background; t.backgroundEnd = config.background;
    t.text = readableInk(config.background); t.muted = t.text;
    const tint = (amount: number): string => {
      const parts = [1, 3, 5].map((i) => Math.round(parseInt(config.background!.slice(i, i + 2), 16) * (1 - amount)
        + parseInt(t.text.slice(i, i + 2), 16) * amount).toString(16).padStart(2, "0"));
      return `#${parts.join("")}`;
    };
    t.surface = tint(0.045); t.surfaceRaised = tint(0.085); t.border = tint(0.25);
  }
  if (config.backgroundStyle) t.backgroundStyle = config.backgroundStyle;
  if (config.fontFamily) t.fontFamily = config.fontFamily;
  if (config.cardStyle) t.radius = config.cardStyle === "square" ? 4 : config.cardStyle === "pill" ? 36 : 18;
  if (config.motion) t.motionFactor = { gentle: 0.35, balanced: 0.65, energetic: 1 }[config.motion];
  return t;
};
const ThemeContext = createContext<GraphicsTheme>(GRAPHICS_THEMES["legacy-lime"]);
export const GraphicsThemeProvider: React.FC<{ config?: GraphicsThemeInput; children: ReactNode }> = ({ config, children }) => (
  <ThemeContext.Provider value={resolveGraphicsTheme(config)}>{children}</ThemeContext.Provider>
);
export const useGraphicsTheme = (): GraphicsTheme => useContext(ThemeContext);
export const THEMED_KINDS = new Set([
  "flow_diagram", "concept_build", "progress_steps", "vs_split", "callout", "keyword_chips",
  "annotated_screenshot", "speaker_canvas", "object_transform",
]);
