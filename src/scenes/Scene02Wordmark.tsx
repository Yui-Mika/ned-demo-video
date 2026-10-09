import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { useSceneFrame } from "../time";
import { Backdrop } from "../components/Backdrop";
import { WORDMARK } from "../script";
import { colors, ease, fonts, gradients, layout, SAFE, sec, type as typeScale } from "../tokens";
import { HomeScreen } from "../ui/phone/HomeScreen";
import { DeviceFrame, FootageFrame, TextBlock, frameMode, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const PHONE_IN = 2.2; // the phone enters after the sweep (SPEC 16)

const Wordmark: React.FC<{ opacity: number; scale: number; origin: string }> = ({ opacity, scale, origin }) => (
  <div
    style={{
      fontFamily: fonts.display,
      fontWeight: 700,
      fontSize: typeScale.wordmarkSize,
      lineHeight: 1,
      letterSpacing: "0.02em",
      color: colors.white,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: origin,
      textShadow: "0 0 60px rgba(184,122,237,0.55)",
    }}
  >
    {WORDMARK.slice(0, -1)}
    <span style={{ backgroundImage: gradients.accent, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
      {WORDMARK.slice(-1)}
    </span>
  </div>
);

// ref-02 look: purple sweep (dark to light), wordmark as text over the glow, then
// the headline; Home on the phone enters after the sweep.
export const Scene02Wordmark: React.FC<SceneProps> = (props) => {
  const frame = useSceneFrame();
  const { scene } = props;
  const mode = frameMode(scene, props.footageExists);

  const sweep = interpolate(frame, [0, sec(1.8)], [0, 1], { ...clamp, easing: ease });
  const glow = interpolate(frame, [sec(0.6), sec(1.8)], [0.3, 1.1], clamp);
  const wIn = interpolate(frame, [sec(0.3), sec(1.3)], [0, 1], { ...clamp, easing: ease });
  const fIn = interpolate(frame, [sec(PHONE_IN), sec(PHONE_IN + 0.9)], [0, 1], { ...clamp, easing: ease });

  const band = (
    <AbsoluteFill
      style={{
        top: 1080 - sweep * 3000,
        height: 1800,
        background: gradients.band,
        opacity: interpolate(sweep, [0, 0.1, 0.75, 1], [0, 0.95, 0.6, 0]),
      }}
    />
  );

  if (mode === "ui" && scene.ui) {
    // Left column: wordmark at ~20% from the top, the headline under it.
    return (
      <AbsoluteFill>
        <Backdrop theme="dark" glow={glow} />
        {band}
        <DeviceFrame kind="phone" camera={scene.ui.camera} enter={fIn} rise={420}>
          <HomeScreen view="vn" />
        </DeviceFrame>
        <div style={{ position: "absolute", left: layout.textLeft, top: layout.headlineTop }}>
          <Wordmark opacity={wIn} scale={0.9 + 0.1 * wIn} origin="0% 0%" />
        </div>
        <TextBlock scene={scene} placement="column" top={layout.headlineTop + typeScale.wordmarkSize + 40} swap />
      </AbsoluteFill>
    );
  }

  // Footage (or placeholder): wordmark centred, then it lifts into the top margin.
  const lift = interpolate(frame, [sec(1.4), sec(2.1)], [0, 1], { ...clamp, easing: ease });
  const top = 540 - typeScale.wordmarkSize * 0.62 + (SAFE.top - (540 - typeScale.wordmarkSize * 0.62)) * lift;
  return (
    <AbsoluteFill>
      <Backdrop theme="dark" glow={glow} />
      {band}
      <FootageFrame {...props} enter={fIn} rise={420} scale={0.82} />
      <AbsoluteFill style={{ top, height: "auto", alignItems: "center" }}>
        <Wordmark opacity={wIn} scale={(0.9 + 0.1 * wIn) * (1 - 0.5 * lift)} origin="50% 0%" />
      </AbsoluteFill>
      <TextBlock scene={scene} placement="top" top={SAFE.top + 110} swap />
    </AbsoluteFill>
  );
};
