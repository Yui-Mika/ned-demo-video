import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { durations, ease, layout, sec } from "../tokens";
import { copy } from "../ui/copy";
import { WebContractNewScreen } from "../ui/web/WebContractNewScreen";
import type { BriefState } from "../ui/state";
import { DeviceFrame, FootageFrame, TextBlock, frameMode, windowProgress, FOOTAGE_HEADLINE_TOP, useSceneSec, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ITEMS = copy.web.contractNew.milestones.list[0].crit;

// The brief at time t: each "Done when" item is typed over the first 85% of its
// window and added at the end (the board's add flow, as in the landing).
const briefAt = (t: number, typing: [number, number][]): BriefState => {
  let added = 0;
  let draft = "";
  typing.forEach(([a, b], i) => {
    if (t >= b) added = i + 1;
    else if (t > a) draft = ITEMS[i].slice(0, Math.round(ITEMS[i].length * Math.min(1, (t - a) / ((b - a) * 0.85))));
  });
  return { added, draft, panel: "closed", created: false };
};

// ref-04 look: the window rises under the sentence; the web contract editor
// types the "Done when" items, the brief fingerprint changes per keystroke.
export const Scene03Brief: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const t = useSceneSec();
  const { scene } = props;
  const mode = frameMode(scene, props.footageExists);
  const rise = interpolate(frame, [sec(0.2), sec(0.2 + durations.frameEnter)], [0, 1], { ...clamp, easing: ease });
  const dolly = windowProgress(t, [0, scene.endSec - scene.startSec]); // slow eased tilt over the scene

  if (mode === "ui" && scene.ui) {
    return (
      <AbsoluteFill>
        <Backdrop theme="light" />
        <DeviceFrame kind="laptop" camera={scene.ui.camera} enter={rise} rotateY={-9 + 4 * dolly} rise={300}>
          <WebContractNewScreen state={briefAt(t, scene.ui.typing ?? [])} width={1440} height={2600} />
        </DeviceFrame>
        <TextBlock scene={scene} placement="column" width={layout.laptop.left - layout.textLeft - 60} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Backdrop theme="light" />
      <FootageFrame {...props} enter={rise} rotateX={14} rotateY={-9 + 6 * dolly} scale={1 + 0.03 * dolly} rise={500} glow={0.75} />
      <TextBlock scene={scene} placement="top" top={FOOTAGE_HEADLINE_TOP} />
    </AbsoluteFill>
  );
};
