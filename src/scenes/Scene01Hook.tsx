import React, { useContext } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { ease, easeTravel, SAFE, sec, type as typeScale, video } from "../tokens";
import { SceneLength } from "./time";
import { FootageFrame, TextBlock, type SceneProps } from "./common";

const HOOK = typeScale.hookSize + 16;

// ref-01 look: dim, blurred blank cards drifting in perspective behind the text.
// `speed` is px per frame at 30 fps; the drift is eased over the scene (no linear motion).
const GhostCard: React.FC<{ x: number; y: number; w: number; h: number; r: number; speed: number }> = ({ x, y, w, h, r, speed }) => {
  const frame = useCurrentFrame();
  const len = useContext(SceneLength);
  const d = interpolate(frame / video.fps, [0, len], [0, len * 30], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeTravel });
  return (
    <div
      style={{
        position: "absolute",
        left: x + d * speed,
        top: y - d * speed * 0.4,
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

// Hook. Stays abstract (no product UI): the recording if it exists, otherwise
// only the drifting cards and the two lines, centred inside the safe area.
export const Scene01Hook: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [sec(0.2), sec(1.4), sec(6)], [0.72, 0.95, 1.02], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const enter = interpolate(frame, [sec(0.1), sec(0.9)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <AbsoluteFill>
      <Backdrop theme="dark" glow={0.7} glowY={props.footageExists ? 100 : 70} />
      <GhostCard x={-60} y={150} w={420} h={240} r={18} speed={0.25} />
      <GhostCard x={1560} y={150} w={380} h={260} r={-16} speed={-0.2} />
      <GhostCard x={40} y={680} w={440} h={260} r={14} speed={0.18} />
      <GhostCard x={1500} y={700} w={420} h={240} r={-12} speed={-0.25} />
      {props.footageExists ? (
        <>
          <FootageFrame {...props} enter={enter} scale={push} rotateX={14} rotateY={-6} />
          <TextBlock scene={props.scene} placement="top" top={SAFE.top} size={72} />
        </>
      ) : (
        <TextBlock scene={props.scene} placement="top" top={(1080 - 2 * HOOK * 1.12) / 2} size={HOOK} />
      )}
    </AbsoluteFill>
  );
};

