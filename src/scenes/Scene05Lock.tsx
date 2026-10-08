import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PerspectiveFrame } from "../components/PerspectiveFrame";
import { durations, ease, sec } from "../tokens";
import { Beats, FrameContent, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ref-09 look: camera closes in on the button while the cursor clicks, then
// pulls back to show the result (laptop wallet panel, then the phone).
export const Scene05Lock: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const W = 1080;
  const t = frame / 30;
  const targets = props.scene.cursor?.targets ?? [];
  const a = targets[0] ?? { x: 0.5, y: 0.5 };
  const b = targets[1] ?? a;
  const enter = interpolate(frame, [sec(0.1), sec(0.1 + durations.frameEnter)], [0, 1], { ...clamp, easing: ease });
  const zoomScale = interpolate(t, [0.2, 0.9, 2.0, 2.4, 3.4, 4.1], [1, 1.45, 1.45, 1.35, 1.35, 1], { ...clamp, easing: ease });
  const toB = interpolate(t, [1.6, 2.2], [0, 1], { ...clamp, easing: ease });
  const zoom = { scale: zoomScale, x: a.x + (b.x - a.x) * toB, y: a.y + (b.y - a.y) * toB };
  return (
    <AbsoluteFill>
      <Backdrop theme="light" />
      <PerspectiveFrame width={W} top={300} rotateX={12} rotateY={8} translateY={(1 - enter) * 200} opacity={enter} zoom={zoom}>
        <FrameContent {...props} width={W} />
      </PerspectiveFrame>
      <Beats scene={props.scene} top={110} />
    </AbsoluteFill>
  );
};
