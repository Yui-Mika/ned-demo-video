import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { CornerBrackets, ScanLine } from "../components/Bits";
import { FRAME_ASPECT } from "../components/PerspectiveFrame";
import type { UiSettings } from "../script";
import { durations, ease, layout, sec } from "../tokens";
import type { SubmitState } from "../ui/state";
import { WebSubmitScreen } from "../ui/web/WebSubmitScreen";
import { DeviceFrame, FootageFrame, TextBlock, frameMode, swapProgress, FOOTAGE_HEADLINE_TOP, useSceneSec, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// The submit page at time t: links and "Done when" ticks already in place, files
// dropped one by one, each fingerprint shown once the scan line has passed it.
const formAt = (t: number, ui: UiSettings): SubmitState => ({
  links: 2,
  draft: "",
  files: (ui.files ?? []).filter((f) => t >= f).length,
  scanned: (ui.scanned ?? []).filter((f) => t >= f).length,
  checks: 4,
  panel: "closed",
  done: false,
});
// The submitted view ("Submitted · in review", "On time").
const DONE: SubmitState = { links: 2, draft: "", files: 2, scanned: 2, checks: 4, panel: "closed", done: true };

// ref-05 look: the page in a scan frame (four corner brackets); a thin purple
// scan line passes over the dropped files and leaves their short codes.
export const Scene06Submit: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const t = useSceneSec();
  const { scene } = props;
  const mode = frameMode(scene, props.footageExists);
  const enter = interpolate(frame, [sec(0.1), sec(0.1 + durations.frameEnter)], [0, 1], { ...clamp, easing: ease });
  const brackets = interpolate(frame, [sec(0.4), sec(0.8)], [0, 1], clamp);
  const scanAt = scene.scanAtSec ?? 1;

  if (mode === "ui" && scene.ui) {
    return (
      <AbsoluteFill>
        <Backdrop theme="dark" />
        <DeviceFrame
          kind="laptop"
          camera={scene.ui.camera}
          cursor={scene.ui.cursor}
          enter={enter}
          rotateY={-5}
          outside={<CornerBrackets opacity={brackets} />}
          overlay={<ScanLine atSec={scanAt} height={layout.laptop.h} />}
          layers={[
            { node: <WebSubmitScreen state={formAt(t, scene.ui)} width={1440} height={2600} />, camera: scene.ui.camera },
            {
              node: <WebSubmitScreen state={DONE} width={1440} height={2600} />,
              camera: scene.ui.swapCamera ?? scene.ui.camera,
              opacity: swapProgress(t, scene.ui.swapSec),
            },
          ]}
        />
        <TextBlock scene={scene} placement="column" width={layout.laptop.left - layout.textLeft - 60} />
      </AbsoluteFill>
    );
  }
  const H = Math.round(layout.footage.w / FRAME_ASPECT);
  return (
    <AbsoluteFill>
      <Backdrop theme="dark" />
      <FootageFrame {...props} enter={enter} rotateX={10} rotateY={-4} outside={<CornerBrackets opacity={brackets} />}>
        <ScanLine atSec={scanAt} height={H} />
      </FootageFrame>
      <TextBlock scene={scene} placement="top" top={FOOTAGE_HEADLINE_TOP} />
    </AbsoluteFill>
  );
};
