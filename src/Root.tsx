import React from "react";
import { Composition } from "remotion";
import { Teaser, type TeaserProps } from "./Teaser";
import { scenes } from "./script";
import { video } from "./tokens";
import { FPS, retime } from "./time";

const timeline = retime(scenes);

import { Atlas } from "./dev/Atlas";
import { Probe, PROBE } from "./dev/Probe";

export const RemotionRoot: React.FC = () => (
  <>
  {/* Dev only (not rendered by the npm scripts): UiAtlas = every screen flat, for measuring cursor and camera
      targets; Probe = Teaser frames listed in src/dev/Probe.tsx. */}
  <Composition id="UiAtlas" component={Atlas} width={4500} height={3600} fps={30} durationInFrames={1} />
  <Composition id="Probe" component={Probe} width={1920} height={1080} fps={30} durationInFrames={PROBE.length} />
  <Composition
    id="Teaser"
    component={Teaser}
    width={video.width}
    height={video.height}
    fps={FPS}
    durationInFrames={Math.round(timeline[timeline.length - 1].endSec * FPS)}
    defaultProps={{ burnSubtitles: false } satisfies TeaserProps}
  />
  </>
);
