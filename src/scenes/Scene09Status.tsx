import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { durations, ease, sec } from "../tokens";
import { DisclosuresScreen } from "../ui/phone/DisclosuresScreen";
import { DeviceFrame, FootageFrame, TextBlock, frameMode, windowProgress, FOOTAGE_HEADLINE_TOP, useSceneSec, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Honest status. Light scene (ref-11 palette) but FADE ONLY: no blur or slide on
// the disclosure text (BRIEF 5, SPEC 14.4 wins over the reference's blur reveal).
// The Disclosures list scrolls and the NOT YET rows light, both from the frame number.
export const Scene09Status: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const t = useSceneSec();
  const { scene } = props;
  const mode = frameMode(scene, props.footageExists);
  const fade = interpolate(frame, [sec(0.4), sec(0.4 + durations.fade * 2)], [0, 1], { ...clamp, easing: ease });

  if (mode === "ui" && scene.ui) {
    return (
      <AbsoluteFill>
        <Backdrop theme="light" />
        <DeviceFrame kind="phone" camera={scene.ui.camera} enter={fade} rise={0} rotateX={6} rotateY={-6} glow={0.7}>
          <DisclosuresScreen scroll={windowProgress(t, scene.ui.scroll)} light={windowProgress(t, scene.ui.light)} />
        </DeviceFrame>
        <TextBlock scene={scene} placement="column" mode="fade" />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Backdrop theme="light" />
      <FootageFrame {...props} enter={fade} rise={0} rotateX={10} glow={0.7} />
      <TextBlock scene={scene} placement="top" top={FOOTAGE_HEADLINE_TOP - 50} mode="fade" />
    </AbsoluteFill>
  );
};
