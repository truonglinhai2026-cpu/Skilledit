import { GraphicsShowcase, GraphicsTemplateCheck } from "./GraphicsShowcase";
import { AbsoluteFill, Composition, staticFile } from "remotion";
import { EditedVideo, type EditedVideoProps } from "./EditedVideo";
import {
  getSlideshowDurationInFrames,
  Slideshow,
  type SlideshowProps,
} from "./Slideshow";
import { StyleShowcase } from "./StyleShowcase";
import { DarkGridBg, LightGridBg } from "./templates/Backgrounds";
import props from "./props.json";
import slideshow from "./slideshow.json";

const DarkGridFrame = () => <AbsoluteFill><DarkGridBg /></AbsoluteFill>;
const LightGridFrame = () => <AbsoluteFill><LightGridBg /></AbsoluteFill>;

const typed = props as unknown as EditedVideoProps & {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
};
const slideshowProps = slideshow as SlideshowProps;

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="Slideshow"
        component={Slideshow}
        durationInFrames={getSlideshowDurationInFrames(slideshowProps)}
        fps={slideshowProps.fps}
        width={slideshowProps.width}
        height={slideshowProps.height}
        defaultProps={slideshowProps}
        calculateMetadata={({ props: inputProps }) => ({
          durationInFrames: getSlideshowDurationInFrames(inputProps),
          fps: inputProps.fps,
          width: inputProps.width,
          height: inputProps.height,
        })}
      />
      <Composition id="GraphicsShowcase" component={GraphicsShowcase} durationInFrames={720} fps={30} width={720} height={1280} defaultProps={{videoSrc: "gradient"}} />
      <Composition id="GraphicsShowcaseLandscape" component={GraphicsShowcase} durationInFrames={720} fps={30} width={1280} height={720} defaultProps={{videoSrc: "gradient"}} />
      <Composition id="GraphicsTemplateCheck" component={GraphicsTemplateCheck} durationInFrames={180} fps={30} width={720} height={1280} defaultProps={{kind: "flow_diagram", theme: "dark-tech", videoSrc: "qa/source.mp4"}} />
      <Composition id="GraphicsTemplateCheckLandscape" component={GraphicsTemplateCheck} durationInFrames={180} fps={30} width={1280} height={720} defaultProps={{kind: "flow_diagram", theme: "dark-tech", videoSrc: "qa/source.mp4"}} />
      <Composition
        id="EditedVideo"
        component={EditedVideo}
        durationInFrames={typed.durationInFrames}
        fps={typed.fps}
        width={typed.width}
        height={typed.height}
        defaultProps={typed}
      />
      <Composition
        id="StyleShowcase"
        component={StyleShowcase}
        durationInFrames={30 * 125}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* 16:9 variant for verifying landscape templates side-by-side. */}
      <Composition
        id="StyleShowcaseLandscape"
        component={StyleShowcase}
        durationInFrames={30 * 125}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DarkGridFrame"
        component={DarkGridFrame}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="LightGridFrame"
        component={LightGridFrame}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};

// Re-exported so Remotion picks it up
export { staticFile };
