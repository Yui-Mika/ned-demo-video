import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { PerspectiveFrame } from "../components/PerspectiveFrame";
import { GlassPill } from "../components/Bits";
import { release } from "../script";
import { colors, durations, ease, fonts, sec, type as typeScale } from "../tokens";
import { FrameContent, SmallLine, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const formatVnd = (n: number) => n.toLocaleString("en-US");

// Climax. Cursor slides to release, then (ref-10 look) a glossy pill with the
// USDC amount crosses the seam and the big VND count runs. Glow on the landing
// layer only.
export const Scene07Release: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const W = 1080;
  const { pillAtSec, crossAtSec } = release;

  const enter = interpolate(frame, [0, sec(0.6)], [0, 1], { ...clamp, easing: ease });
  const recede = interpolate(frame, [sec(pillAtSec - 0.3), sec(pillAtSec + 0.4)], [0, 1], { ...clamp, easing: ease });
  const glow = 0.8 + 0.7 * interpolate(frame, [sec(crossAtSec), sec(crossAtSec + 0.5)], [0, 1], clamp);

  const pillIn = interpolate(frame, [sec(pillAtSec), sec(pillAtSec + 0.5)], [0, 1], { ...clamp, easing: ease });
  const cross = interpolate(frame, [sec(crossAtSec), sec(crossAtSec + 0.6)], [0, 1], { ...clamp, easing: ease });
  const pillOut = interpolate(frame, [sec(crossAtSec + 0.35), sec(crossAtSec + 0.6)], [1, 0], clamp);
  const seam = interpolate(frame, [sec(pillAtSec), sec(pillAtSec + 0.4), sec(crossAtSec + 0.5), sec(crossAtSec + 0.9)], [0, 1, 1, 0], clamp);

  const countP = interpolate(frame, [sec(crossAtSec + 0.3), sec(crossAtSec + 0.3 + durations.count)], [0, 1], { ...clamp, easing: ease });
  const countIn = interpolate(frame, [sec(crossAtSec + 0.3), sec(crossAtSec + 0.6)], [0, 1], clamp);
  // Round to 10,000 while counting; land exactly on the target value.
  const value = countP >= 1 ? release.toValue : Math.round((release.toValue * countP) / 10000) * 10000;
  const pop = 1 + 0.04 * interpolate(frame, [sec(crossAtSec + 1.8), sec(crossAtSec + 2.0), sec(crossAtSec + 2.4)], [0, 1, 0], clamp);

  return (
    <AbsoluteFill>
      <Backdrop theme="dark" glow={glow} glowY={78} />
      <PerspectiveFrame
        width={W}
        top={240}
        rotateX={12 + 8 * recede}
        scale={1 - 0.22 * recede}
        translateY={-60 * recede}
        opacity={enter * (1 - 0.82 * recede)}
        glow={1 - recede}
      >
        <FrameContent {...props} width={W} />
      </PerspectiveFrame>

      {/* the seam the amount crosses */}
      <div
        style={{
          position: "absolute",
          left: 959,
          top: 330,
          width: 2,
          height: 300,
          opacity: seam,
          background: `linear-gradient(180deg, rgba(212,181,247,0) 0%, ${colors.lilac} 50%, rgba(212,181,247,0) 100%)`,
          boxShadow: `0 0 20px ${colors.orchid}`,
        }}
      />
      <AbsoluteFill style={{ top: 420, height: "auto", alignItems: "center" }}>
        <div style={{ transform: `translateX(${-330 + 660 * cross}px) scale(${0.9 + 0.1 * pillIn})`, opacity: pillIn * pillOut }}>
          <GlassPill style={{ fontSize: 64 }}>{release.fromLabel}</GlassPill>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ top: 380, height: "auto", alignItems: "center", opacity: countIn }}>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: typeScale.amountSize,
            letterSpacing: "-0.02em",
            fontVariantNumeric: "tabular-nums",
            color: colors.white,
            textShadow: "0 0 50px rgba(184,122,237,0.7)",
            transform: `scale(${pop})`,
            whiteSpace: "nowrap",
          }}
        >
          {release.toPrefix}
          {formatVnd(value)}
          {release.toSuffix}
        </div>
        <SmallLine text={release.estimateNote} atSec={crossAtSec + 0.5} theme="dark" style={{ marginTop: 6, fontSize: 34 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 840, height: "auto", alignItems: "center" }}>
        <SmallLine text={release.simulatedNote} atSec={crossAtSec + 0.9} theme="dark" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
