import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PerspectiveFrame, FRAME_ASPECT } from "../components/PerspectiveFrame";
import { CornerBrackets, ScanLine } from "../components/Bits";
import { durations, ease, sec } from "../tokens";
import { Beats, FrameContent, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ref-05 look: document in a scan frame (four corner brackets), a thin purple
// scan line passes over the footage and leaves the short codes.
export const Scene06Submit: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const W = 1040;
  const H = Math.round(W / FRAME_ASPECT);
  const enter = interpolate(frame, [sec(0.1), sec(0.1 + durations.frameEnter)], [0, 1], { ...clamp, easing: ease });
  const brackets = interpolate(frame, [sec(0.6), sec(1.0)], [0, 1], clamp);
  const push = interpolate(frame, [0, sec(5)], [0.98, 1.03], clamp);
  return (
    <AbsoluteFill>
      <Backdrop theme="dark" />
      <PerspectiveFrame
        width={W}
        top={320}
        rotateX={10}
        rotateY={-4}
        scale={push}
        translateY={(1 - enter) * 180}
        opacity={enter}
        outside={<CornerBrackets opacity={brackets} />}
      >
        <FrameContent {...props} width={W}>
          <ScanLine atSec={props.scene.scanAtSec ?? 1} height={H} />
        </FrameContent>
      </PerspectiveFrame>
      <Beats scene={props.scene} top={110} />
    </AbsoluteFill>
  );
};
