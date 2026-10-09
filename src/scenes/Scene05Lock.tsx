import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { durations, ease, layout, sec } from "../tokens";
import { ContractLockScreen } from "../ui/phone/ContractLockScreen";
import { ContractLockedScreen } from "../ui/phone/ContractLockedScreen";
import { WebWorkspaceScreen } from "../ui/web/WebWorkspaceScreen";
import { DeviceFrame, FootageFrame, TextBlock, frameMode, swapProgress, windowProgress, FOOTAGE_HEADLINE_TOP, useSceneSec, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ref-09 look: the client's Workspace, tap "Lock in wallet", the wallet panel opens
// (the phone app's lock screen at 86%), slide to lock, then your phone shows
// "Locked ≈ 13,010,000 VND" (example, estimated).
export const Scene05Lock: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const t = useSceneSec();
  const { scene } = props;
  const mode = frameMode(scene, props.footageExists);
  const enter = interpolate(frame, [sec(0.1), sec(0.1 + durations.frameEnter)], [0, 1], { ...clamp, easing: ease });

  if (mode === "ui" && scene.ui) {
    const ui = scene.ui;
    const toPhone = swapProgress(t, ui.swap2Sec);
    return (
      <AbsoluteFill>
        <Backdrop theme="light" />
        {toPhone < 1 ? (
          <DeviceFrame
            kind="laptop"
            camera={ui.camera}
            cursor={ui.cursor}
            enter={enter * (1 - toPhone)}
            rise={0}
            rotateY={-6}
            layers={[
              { node: <WebWorkspaceScreen width={1440} height={900} panel={null} />, camera: ui.camera },
              {
                node: <WebWorkspaceScreen width={1440} height={900} panel={<ContractLockScreen slide={windowProgress(t, ui.slide)} />} />,
                camera: ui.swapCamera ?? ui.camera,
                opacity: swapProgress(t, ui.swapSec),
              },
            ]}
          />
        ) : null}
        {toPhone > 0 ? (
          <DeviceFrame kind="phone" camera={ui.swap2Camera ?? []} enter={toPhone} rise={0} rotateY={-6}>
            <ContractLockedScreen side="freelancerVN" />
          </DeviceFrame>
        ) : null}
        <TextBlock scene={scene} placement="column" width={layout.laptop.left - layout.textLeft - 60} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <Backdrop theme="light" />
      <FootageFrame {...props} enter={enter} rotateY={8} />
      <TextBlock scene={scene} placement="top" top={FOOTAGE_HEADLINE_TOP} />
    </AbsoluteFill>
  );
};
