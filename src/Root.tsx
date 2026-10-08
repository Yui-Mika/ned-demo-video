import React from "react";
import { Composition } from "remotion";
import { Teaser, type TeaserProps } from "./Teaser";
import { scenes } from "./script";
import { sec, video } from "./tokens";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Teaser"
    component={Teaser}
    width={video.width}
    height={video.height}
    fps={video.fps}
    durationInFrames={sec(scenes[scenes.length - 1].endSec)}
    defaultProps={{ burnSubtitles: false } satisfies TeaserProps}
  />
);
