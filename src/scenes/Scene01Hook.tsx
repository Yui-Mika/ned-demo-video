import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PerspectiveFrame } from "../components/PerspectiveFrame";
import { ease, sec, type as typeScale } from "../tokens";
import { Beats, FrameContent, type SceneProps } from "./common";

// ref-01 look: dim, blurred blank cards drifting in perspective behind the text.
const GhostCard: React.FC<{ x: number; y: number; w: number; h: number; r: number; speed: number }> = ({ x, y, w, h, r, speed }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x + frame * speed,
        top: y - frame * speed * 0.4,
        width: w,
        height: h,
        borderRadius: 18,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        filter: "blur(3px)",
        transform: `perspective(1200px) rotateX(14deg) rotateY(${r}deg)`,
        padding: 26,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {[0.6, 0.85, 0.4].map((f, i) => (
        <div key={i} style={{ height: 12, width: `${f * 100}%`, borderRadius: 6, background: "rgba(255,255,255,0.09)" }} />
      ))}
    </div>
  );
};

export const Scene01Hook: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const W = 1040;
  // Fast push-in, then a slow drift so the frame never sits still.
  const push = interpolate(frame, [sec(0.2), sec(1.4), sec(6)], [0.72, 0.95, 1.02], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const enter = interpolate(frame, [sec(0.1), sec(0.9)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Backdrop theme="dark" glow={0.7} />
      <GhostCard x={-60} y={120} w={420} h={240} r={18} speed={0.25} />
      <GhostCard x={1560} y={90} w={380} h={260} r={-16} speed={-0.2} />
      <GhostCard x={40} y={700} w={440} h={260} r={14} speed={0.18} />
      <GhostCard x={1500} y={720} w={420} h={240} r={-12} speed={-0.25} />
      <PerspectiveFrame width={W} top={350} rotateX={14} rotateY={-6} scale={push} opacity={enter} glow={0.8}>
        <FrameContent {...props} width={W} />
      </PerspectiveFrame>
      <Beats scene={props.scene} top={56} size={typeScale.hookSize} />
    </AbsoluteFill>
  );
};
