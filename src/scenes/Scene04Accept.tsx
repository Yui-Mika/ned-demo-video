import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PerspectiveFrame } from "../components/PerspectiveFrame";
import { durations, ease, sec } from "../tokens";
import { Beats, FrameContent, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ref-06 look: a big window in strong perspective, slow tilt and drift.
export const Scene04Accept: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const W = 1120;
  const enter = interpolate(frame, [sec(0.2), sec(0.2 + durations.frameEnter)], [0, 1], { ...clamp, easing: ease });
  const drift = interpolate(frame, [0, sec(5)], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Backdrop theme="dark" glowY={95} />
      <PerspectiveFrame
        width={W}
        top={300}
        offsetX={40 - 40 * drift}
        rotateX={16 - 4 * drift}
        rotateY={-12 + 5 * drift}
        translateY={(1 - enter) * 160}
        opacity={enter}
      >
        <FrameContent {...props} width={W} />
      </PerspectiveFrame>
      <Beats scene={props.scene} top={110} />
    </AbsoluteFill>
  );
};
