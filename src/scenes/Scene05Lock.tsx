import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { useSceneFrame } from "../time";
import { Backdrop } from "../components/Backdrop";
import { durations, ease, sec } from "../tokens";
import { ContractLockScreen } from "../ui/phone/ContractLockScreen";
import { ContractLockedScreen } from "../ui/phone/ContractLockedScreen";
import { DeviceFrame, FootageFrame, TextBlock, frameMode, windowProgress, FOOTAGE_HEADLINE_TOP, useSceneSec, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ref-09 look: close on the slider while the cursor slides "Slide to lock", then
// the locked screen ("Locked ≈ 13,010,000 VND", example, estimated).
export const Scene05Lock: React.FC<SceneProps> = (props) => {
  const frame = useSceneFrame();
  const t = useSceneSec();
  const { scene } = props;
  const mode = frameMode(scene, props.footageExists);
  const enter = interpolate(frame, [sec(0.1), sec(0.1 + durations.frameEnter)], [0, 1], { ...clamp, easing: ease });

  if (mode === "ui" && scene.ui) {
    const ui = scene.ui;
    const swap = interpolate(t, [ui.swapSec ?? 99, (ui.swapSec ?? 99) + 0.3], [0, 1], clamp);
    return (
      <AbsoluteFill>
        <Backdrop theme="light" />
        <DeviceFrame kind="phone" camera={ui.camera} cursor={ui.cursor} enter={enter} rotateY={-6}>
          <div style={{ position: "absolute", inset: 0, isolation: "isolate" }}>
            <ContractLockScreen slide={windowProgress(t, ui.slide)} />
          </div>
          {swap > 0 ? (
            <div style={{ position: "absolute", inset: 0, zIndex: 10, isolation: "isolate", opacity: swap }}>
              <ContractLockedScreen side="freelancerVN" />
            </div>
          ) : null}
        </DeviceFrame>
        <TextBlock scene={scene} placement="column" />
      </AbsoluteFill>
    );
  }

  const zoomScale = interpolate(t, [0.2, 0.9, 2.0, 2.4, 3.4, 4.1], [1, 1.45, 1.45, 1.35, 1.35, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <Backdrop theme="light" />
      <FootageFrame {...props} enter={enter} rotateY={8} scale={0.95 + 0.05 * zoomScale} />
      <TextBlock scene={scene} placement="top" top={FOOTAGE_HEADLINE_TOP} />
    </AbsoluteFill>
  );
};
