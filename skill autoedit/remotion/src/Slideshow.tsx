import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  staticFile,
} from "remotion";

export type SlideshowItem = {
  src: string;
  type: "image" | "video";
  durationInSeconds: number;
  fit?: "cover" | "contain";
  muted?: boolean;
};

export type SlideshowProps = {
  width: number;
  height: number;
  fps: number;
  backgroundColor: string;
  items: SlideshowItem[];
  srcMode?: "static" | "url";
};

export const validateSlideshowProps = (props: SlideshowProps): void => {
  if (!Number.isInteger(props.width) || props.width <= 0) {
    throw new Error("Slideshow width must be a positive integer.");
  }
  if (!Number.isInteger(props.height) || props.height <= 0) {
    throw new Error("Slideshow height must be a positive integer.");
  }
  if (!Number.isFinite(props.fps) || props.fps <= 0) {
    throw new Error("Slideshow fps must be a positive number.");
  }
  if (props.srcMode && props.srcMode !== "static" && props.srcMode !== "url") {
    throw new Error('Slideshow srcMode must be "static" or "url".');
  }
  if (!Array.isArray(props.items) || props.items.length === 0) {
    throw new Error("Slideshow must contain at least one image or video.");
  }

  props.items.forEach((item, index) => {
    if (!item.src?.trim()) {
      throw new Error(`Slideshow item ${index + 1} is missing its src path.`);
    }
    if (item.type !== "image" && item.type !== "video") {
      throw new Error(`Slideshow item ${index + 1} must have type "image" or "video".`);
    }
    if (!Number.isFinite(item.durationInSeconds) || item.durationInSeconds <= 0) {
      throw new Error(`Slideshow item ${index + 1} must have a positive durationInSeconds.`);
    }
    if (item.fit && item.fit !== "cover" && item.fit !== "contain") {
      throw new Error(`Slideshow item ${index + 1} fit must be "cover" or "contain".`);
    }
  });
};

export const getSlideshowDurationInFrames = (props: SlideshowProps): number => {
  validateSlideshowProps(props);
  return props.items.reduce(
    (total, item) => total + Math.max(1, Math.round(item.durationInSeconds * props.fps)),
    0,
  );
};

export const Slideshow: React.FC<SlideshowProps> = ({
  items,
  backgroundColor,
  fps,
  srcMode = "static",
}) => {
  let from = 0;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {items.map((item, index) => {
        const durationInFrames = Math.max(
          1,
          Math.round(item.durationInSeconds * fps),
        );
        const startFrame = from;
        from += durationInFrames;
        const src = srcMode === "url" ? item.src : staticFile(item.src);

        return (
          <Sequence
            key={`${index}-${item.src}`}
            from={startFrame}
            durationInFrames={durationInFrames}
          >
            <AbsoluteFill>
              {item.type === "image" ? (
                <Img
                  src={src}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: item.fit ?? "contain",
                  }}
                />
              ) : (
                <OffthreadVideo
                  src={src}
                  muted={item.muted ?? false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: item.fit ?? "contain",
                  }}
                />
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
