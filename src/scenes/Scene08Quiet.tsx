import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { useSceneFrame, useSceneScale } from "../time";
import type { CameraKey, CursorSettings, Scene } from "../script";
import { Backdrop } from "../components/Backdrop";
import { ease, layout, sec } from "../tokens";
import { ContractAnyoneActionScreen } from "../ui/phone/ContractAnyoneActionScreen";
import { MilestoneReleasedScreen } from "../ui/phone/MilestoneReleasedScreen";
import { DeviceFrame, FootageFrame, TextBlock, frameMode, windowProgress, FOOTAGE_HEADLINE_TOP, useSceneSec, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Inner windows of this scene, in seconds from the scene start on the FINAL
// timeline (scene 8 = 49.0 to 61.0 s, so 0 = 49.0). Screens, camera framing,
// cursor positions and slider thumbs still come from script.ts; only these times
// differ. Fixed by the cursor: travel 1.2 s, press 0.225 s (0.8 / 0.15 original).
const WINDOWS = {
  release: {
    pan: [1.2, 2.1] as [number, number], // camera moves down to the "Release now" sheet (50.2-51.1)
    slide: [3.325, 4.6] as [number, number], // thumb travel; cursor travels 1.9-3.1, presses 3.1-3.325
    cursorOut: 5.4,
  },
  toRefund: [5.7, 6.45] as [number, number], // row moves to the "Refund now" phone (54.7-55.45)
  refund: {
    pan: [6.45, 7.05] as [number, number],
    slide: [8.225, 9.275] as [number, number], // cursor travels 6.8-8.0, presses 8.0-8.225 (55.8-58.3)
    cursorOut: 9.4,
  },
  toResult: [9.5, 10.25] as [number, number], // row moves to "Refunded to client" (58.5-59.25), held to the end
  chip: 6.45, // "No neutral arbiter yet." appears with the "Refund now" sheet
};

// Same camera keys (zoom and focus) with the pan moved to a new window: key 1 starts it, key 2 ends it.
const retimeCamera = (keys: CameraKey[], pan: [number, number]): CameraKey[] =>
  keys.map((k, i) => (i === 1 ? { ...k, atSec: pan[0] } : i === 2 ? { ...k, atSec: pan[1] } : k));

// Same drag (from, to, positions) re-timed so the thumb moves exactly over `slide` (press ends as it starts).
const retimeCursor = (c: CursorSettings | null, slide: [number, number], outSec: number, press: number): CursorSettings | null =>
  c && {
    ...c,
    targets: c.targets.map((tg) => ({ ...tg, atSec: slide[0] - press, dragSec: slide[1] - slide[0] })),
    outSec,
  };

// Three phones in a row (Release now, Refund now, Refunded). The active one sits
// in the centre at full zoom, so its key text is readable; the others wait at
// the sides, smaller and dimmed, and the row moves on at each `active` window.
const W = 702;
const TOP = 420;
const H = 1080 - TOP - 30;
const STEP = 660; // centre-to-centre distance between slots
const SIDE_SCALE = 0.7;

// ref-08 look: a large glow swells and the devices slide in from below.
export const Scene08Quiet: React.FC<SceneProps> = (props) => {
  const frame = useSceneFrame();
  const t = useSceneSec();
  const { scene } = props;
  const k = 1 / useSceneScale(); // final-timeline seconds -> original scene seconds
  const mode = frameMode(scene, props.footageExists);
  const swell = interpolate(frame, [0, sec(1.2), sec(8)], [0.4, 1.3, 1.0], { ...clamp, easing: ease });
  const drift = interpolate(frame, [0, sec(8)], [0, 1], clamp);

  if (mode === "ui" && scene.ui?.phones) {
    const w = (x: [number, number]): [number, number] => [x[0] * k, x[1] * k];
    const PRESS = 0.15; // = durations.cursorPress, original seconds
    const [pa, pb, pc] = scene.ui.phones;
    const sheets = [WINDOWS.release, WINDOWS.refund];
    const phones: typeof scene.ui.phones = [pa, pb].map((ph, i) => ({
      ...ph,
      slide: w(sheets[i].slide),
      camera: retimeCamera(ph.camera, w(sheets[i].pan)),
      cursor: retimeCursor(ph.cursor, w(sheets[i].slide), sheets[i].cursorOut * k, PRESS),
    }));
    phones.push(pc);
    const activeWindows = [w(WINDOWS.toRefund), w(WINDOWS.toResult)];
    const textScene: Scene = { ...scene, chips: scene.chips?.map((c) => ({ ...c, atSec: WINDOWS.chip * k })) };
    const screens = [
      (p: number) => <ContractAnyoneActionScreen kind="release" slide={p} />,
      (p: number) => <ContractAnyoneActionScreen kind="refund" slide={p} />,
      () => <MilestoneReleasedScreen variant="refund" />,
    ];
    // Continuous index of the centre phone: 0, then 1, then 2.
    const active = activeWindows.reduce((n, w) => n + windowProgress(t, w), 0);
    const order = phones.map((_, i) => i).sort((a, b) => Math.abs(b - active) - Math.abs(a - active));
    return (
      <AbsoluteFill>
        <Backdrop theme="dark" glow={swell} glowY={92} />
        {order.map((i) => {
          const p = phones[i];
          const slot = i - active;
          const d = Math.min(1, Math.abs(slot));
          const enter = interpolate(frame, [sec(0.5 + i * 0.15), sec(1.4 + i * 0.15)], [0, 1], { ...clamp, easing: ease });
          return (
            <div key={i} style={{ position: "absolute", inset: 0, opacity: 1 - 0.45 * d }}>
              <DeviceFrame
                kind="phone"
                camera={p.camera}
                cursor={p.cursor}
                enter={enter}
                rise={420}
                rotateX={8 - 3 * drift}
                rotateY={-slot * 10}
                scale={1 - (1 - SIDE_SCALE) * d}
                glow={0.8 * (1 - 0.6 * d)}
                box={{ left: 960 - W / 2 + slot * STEP, top: TOP, w: W, h: H }}
              >
                {screens[i](windowProgress(t, p.slide))}
              </DeviceFrame>
            </div>
          );
        })}
        <TextBlock scene={textScene} placement="top" top={layout.headlineTop - 20} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Backdrop theme="dark" glow={swell} glowY={88} />
      <FootageFrame {...props} enter={interpolate(frame, [sec(0.5), sec(1.5)], [0, 1], { ...clamp, easing: ease })} rotateX={16 - 5 * drift} rotateY={6 - 6 * drift} rise={500} />
      <TextBlock scene={scene} placement="top" top={FOOTAGE_HEADLINE_TOP - 60} />
    </AbsoluteFill>
  );
};
