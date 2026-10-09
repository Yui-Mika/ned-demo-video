import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { durations, ease, sec } from "../tokens";
import { ContractDetailScreen } from "../ui/phone/ContractDetailScreen";
import { ContractAcceptScreen } from "../ui/phone/ContractAcceptScreen";
import { DeviceFrame, FootageFrame, TextBlock, frameMode, swapProgress, windowProgress, FOOTAGE_HEADLINE_TOP, useSceneSec, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ref-06 look: a big tilted device with a slow eased tilt. Contract detail, tap
// "Accept and choose where earnings go", the accept screen (VND destination),
// slide to accept, hold.
export const Scene04Accept: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const t = useSceneSec();
  const { scene } = props;
  const mode = frameMode(scene, props.footageExists);
  const len = scene.endSec - scene.startSec;
  const enter = interpolate(frame, [sec(0.1), sec(0.1 + durations.frameEnter)], [0, 1], { ...clamp, easing: ease });
  const tilt = windowProgress(t, [0, len]);

  if (mode === "ui" && scene.ui) {
    const ui = scene.ui;
    return (
      <AbsoluteFill>
        <Backdrop theme="dark" glowY={95} />
        <DeviceFrame
          kind="phone"
          camera={ui.camera}
          cursor={ui.cursor}
          enter={enter}
          rotateX={8 - 3 * tilt}
          rotateY={-10 + 4 * tilt}
          layers={[
            { node: <ContractDetailScreen variant="vinhNew" />, camera: ui.camera },
            { node: <ContractAcceptScreen slide={windowProgress(t, ui.slide)} />, camera: ui.swapCamera ?? ui.camera, opacity: swapProgress(t, ui.swapSec) },
          ]}
        />
        <TextBlock scene={scene} placement="column" />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Backdrop theme="dark" glowY={95} />
      <FootageFrame {...props} enter={enter} rotateX={16 - 4 * tilt} rotateY={-12 + 5 * tilt} />
      <TextBlock scene={scene} placement="top" top={FOOTAGE_HEADLINE_TOP} />
    </AbsoluteFill>
  );
};
