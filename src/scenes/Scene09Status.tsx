import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PerspectiveFrame } from "../components/PerspectiveFrame";
import { Chip } from "../components/Bits";
import { durations, sec } from "../tokens";
import { Beats, FrameContent, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Honest status. Light scene (ref-11 palette) but FADE ONLY: no blur or slide on
// the disclosure text (BRIEF 5, SPEC 14.4 wins over the reference's blur reveal).
export const Scene09Status: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const W = 1000;
  const fade = interpolate(frame, [sec(0.4), sec(0.4 + durations.fade * 2)], [0, 1], clamp);
  const { scene } = props;
  return (
    <AbsoluteFill>
      <Backdrop theme="light" />
      <PerspectiveFrame width={W} top={350} rotateX={10} rotateY={0} opacity={fade} glow={0.7}>
        <FrameContent {...props} width={W} />
      </PerspectiveFrame>
      <Beats scene={scene} top={100} mode="fade" />
      <AbsoluteFill style={{ top: 205, height: "auto", alignItems: "center" }}>
        {(scene.chips ?? []).map((c, i) => (
          <div key={i} style={{ opacity: interpolate(frame, [sec(c.atSec), sec(c.atSec + durations.fade)], [0, 1], clamp) }}>
            <Chip text={c.text} theme="light" />
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
