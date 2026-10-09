import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { ease, layout, sec } from "../tokens";
import { ContractAnyoneActionScreen } from "../ui/phone/ContractAnyoneActionScreen";
import { MilestoneReleasedScreen } from "../ui/phone/MilestoneReleasedScreen";
import { DeviceFrame, FootageFrame, TextBlock, frameMode, windowProgress, FOOTAGE_HEADLINE_TOP, useSceneSec, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

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
  const frame = useCurrentFrame();
  const t = useSceneSec();
  const { scene } = props;
  const mode = frameMode(scene, props.footageExists);
  const swell = interpolate(frame, [0, sec(1.2), sec(8)], [0.4, 1.3, 1.0], { ...clamp, easing: ease });
  const drift = interpolate(frame, [0, sec(8)], [0, 1], clamp);

  if (mode === "ui" && scene.ui?.phones) {
    const phones = scene.ui.phones;
    const screens = [
      (p: number) => <ContractAnyoneActionScreen kind="release" slide={p} />,
      (p: number) => <ContractAnyoneActionScreen kind="refund" slide={p} />,
      () => <MilestoneReleasedScreen variant="refund" />,
    ];
    // Continuous index of the centre phone: 0, then 1, then 2.
    const active = (scene.ui.active ?? []).reduce((n, w) => n + windowProgress(t, w), 0);
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
        <TextBlock scene={scene} placement="top" top={layout.headlineTop - 20} />
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
