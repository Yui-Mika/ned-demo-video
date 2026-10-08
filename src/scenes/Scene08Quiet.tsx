import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PerspectiveFrame } from "../components/PerspectiveFrame";
import { Chip, useAppear } from "../components/Bits";
import { ease, sec } from "../tokens";
import { Beats, FrameContent, SmallLine, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const SceneChip: React.FC<{ text: string; atSec: number }> = ({ text, atSec }) => {
  const a = useAppear(atSec);
  return (
    <div style={a}>
      <Chip text={text} theme="dark" />
    </div>
  );
};

// ref-08 look: a large glow swells and the devices slide in from below.
export const Scene08Quiet: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const W = 1040;
  const swell = interpolate(frame, [0, sec(1.2), sec(8)], [0.4, 1.3, 1.0], { ...clamp, easing: ease });
  const enter = interpolate(frame, [sec(0.5), sec(1.5)], [0, 1], { ...clamp, easing: ease });
  const drift = interpolate(frame, [0, sec(8)], [0, 1], clamp);
  const { scene } = props;
  return (
    <AbsoluteFill>
      <Backdrop theme="dark" glow={swell} glowY={88} />
      <PerspectiveFrame
        width={W}
        top={340}
        rotateX={16 - 5 * drift}
        rotateY={6 - 6 * drift}
        scale={0.98 + 0.04 * drift}
        translateY={(1 - enter) * 500}
        opacity={enter}
        glow={0.6 + 0.4 * enter}
      >
        <FrameContent {...props} width={W} />
      </PerspectiveFrame>
      <Beats scene={scene} top={70} />
      <AbsoluteFill style={{ top: 158, height: "auto", alignItems: "center", flexDirection: "column", gap: 18 }}>
        {(scene.small ?? []).map((s, i) => (
          <SmallLine key={i} text={s.text} atSec={s.atSec} theme="dark" />
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 240, height: "auto", alignItems: "center" }}>
        {(scene.chips ?? []).map((c, i) => (
          <SceneChip key={i} text={c.text} atSec={c.atSec} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
