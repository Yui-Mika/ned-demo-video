import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { durations, ease, sec } from "../tokens";
import { ContractAcceptScreen } from "../ui/phone/ContractAcceptScreen";
import { DeviceFrame, FootageFrame, TextBlock, frameMode, windowProgress, FOOTAGE_HEADLINE_TOP, useSceneSec, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ref-06 look: a big tilted device, slow tilt and drift. Accept screen: the cursor
// taps the VND option, then slides "Slide to accept".
export const Scene04Accept: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const t = useSceneSec();
  const { scene } = props;
  const mode = frameMode(scene, props.footageExists);
  const enter = interpolate(frame, [sec(0.2), sec(0.2 + durations.frameEnter)], [0, 1], { ...clamp, easing: ease });
  const drift = interpolate(frame, [0, sec(5)], [0, 1], clamp);

  if (mode === "ui" && scene.ui) {
    return (
      <AbsoluteFill>
        <Backdrop theme="dark" glowY={95} />
        <DeviceFrame kind="phone" camera={scene.ui.camera} cursor={scene.ui.cursor} enter={enter} rotateX={8 - 3 * drift} rotateY={-10 + 4 * drift}>
          <ContractAcceptScreen slide={windowProgress(t, scene.ui.slide)} />
        </DeviceFrame>
        <TextBlock scene={scene} placement="column" />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Backdrop theme="dark" glowY={95} />
      <FootageFrame {...props} enter={enter} rotateX={16 - 4 * drift} rotateY={-12 + 5 * drift} />
      <TextBlock scene={scene} placement="top" top={FOOTAGE_HEADLINE_TOP} />
    </AbsoluteFill>
  );
};
