import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PerspectiveFrame } from "../components/PerspectiveFrame";
import { WORDMARK } from "../script";
import { colors, ease, fonts, gradients, sec, type as typeScale } from "../tokens";
import { Beats, FrameContent, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ref-02 look: wordmark reveal over the glow, after a dark-to-light purple sweep.
export const Scene02Wordmark: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const W = 960;

  // Purple band sweeps bottom to top (about 1.8 s), leaving a lilac glow.
  const sweep = interpolate(frame, [0, sec(1.8)], [0, 1], { ...clamp, easing: ease });
  const glow = interpolate(frame, [sec(0.6), sec(1.8)], [0.3, 1.1], clamp);

  // Wordmark: fades and scales in at the centre, then lifts to the top.
  const wIn = interpolate(frame, [sec(0.3), sec(1.3)], [0, 1], { ...clamp, easing: ease });
  const lift = interpolate(frame, [sec(1.4), sec(2.1)], [0, 1], { ...clamp, easing: ease });
  const wordmarkTop = 540 - typeScale.wordmarkSize * 0.62 + (60 - (540 - typeScale.wordmarkSize * 0.62)) * lift;
  const wordmarkScale = (0.9 + 0.1 * wIn) * (1 - 0.45 * lift);

  // Phone enters after the sweep (SPEC 16).
  const fIn = interpolate(frame, [sec(2.2), sec(2.2 + 0.9)], [0, 1], { ...clamp, easing: ease });

  return (
    <AbsoluteFill>
      <Backdrop theme="dark" glow={glow} />
      <AbsoluteFill
        style={{
          top: 1080 - sweep * 3000,
          height: 1800,
          background: gradients.band,
          opacity: interpolate(sweep, [0, 0.1, 0.75, 1], [0, 0.95, 0.6, 0]),
        }}
      />
      <PerspectiveFrame width={W} top={420} rotateX={12} translateY={(1 - fIn) * 420} opacity={fIn} glow={fIn}>
        <FrameContent {...props} width={W} />
      </PerspectiveFrame>
      <AbsoluteFill style={{ top: wordmarkTop, height: "auto", alignItems: "center" }}>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: typeScale.wordmarkSize,
            lineHeight: 1,
            letterSpacing: "0.02em",
            color: colors.white,
            opacity: wIn,
            transform: `scale(${wordmarkScale})`,
            transformOrigin: "50% 0%",
            textShadow: "0 0 60px rgba(184,122,237,0.55)",
          }}
        >
          {WORDMARK.slice(0, -1)}
          <span style={{ backgroundImage: gradients.accent, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            {WORDMARK.slice(-1)}
          </span>
        </div>
      </AbsoluteFill>
      <Beats scene={props.scene} top={250} layout="swap" />
    </AbsoluteFill>
  );
};
