import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PerspectiveFrame } from "../components/PerspectiveFrame";
import { durations, ease, sec } from "../tokens";
import { Beats, FrameContent, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ref-04 look: the window rises from the bottom under the sentence; slow dolly.
export const Scene03Brief: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const W = 1080;
  const rise = interpolate(frame, [sec(0.4), sec(0.4 + durations.frameEnter)], [0, 1], { ...clamp, easing: ease });
  const dolly = interpolate(frame, [0, sec(5)], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Backdrop theme="light" />
      <PerspectiveFrame
        width={W}
        top={300}
        rotateX={14}
        rotateY={-9 + 6 * dolly}
        scale={1 + 0.04 * dolly}
        translateY={(1 - rise) * 600}
        opacity={rise}
        glow={0.75}
      >
        <FrameContent {...props} width={W} />
      </PerspectiveFrame>
      <Beats scene={props.scene} top={110} />
    </AbsoluteFill>
  );
};
