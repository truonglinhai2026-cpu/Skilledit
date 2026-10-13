import { Composition } from "remotion";
import {
  getSlideshowDurationInFrames,
  Slideshow,
  type SlideshowProps,
} from "./Slideshow";

const defaultProps: SlideshowProps = {
  width: 480,
  height: 854,
  fps: 24,
  backgroundColor: "#000000",
  items: [
    {
      src: "https://example.invalid/placeholder.jpg",
      type: "image",
      durationInSeconds: 4,
    },
  ],
  srcMode: "url",
};

export const WebRoot: React.FC = () => (
  <Composition
    id="WebSlideshow"
    component={Slideshow}
    durationInFrames={getSlideshowDurationInFrames(defaultProps)}
    fps={defaultProps.fps}
    width={defaultProps.width}
    height={defaultProps.height}
    defaultProps={defaultProps}
    calculateMetadata={({ props }) => ({
      durationInFrames: getSlideshowDurationInFrames(props),
      fps: props.fps,
      width: props.width,
      height: props.height,
    })}
  />
);
