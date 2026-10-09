import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { GlassPill } from "../components/Bits";
import { release } from "../script";
import { colors, durations, ease, fonts, layout, sec, type as typeScale } from "../tokens";
import { MilestoneReviewScreen } from "../ui/phone/MilestoneReviewScreen";
import { MilestoneReleasedScreen } from "../ui/phone/MilestoneReleasedScreen";
import { DeviceFrame, FootageFrame, SmallLine, frameMode, windowProgress, useSceneSec, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const formatVnd = (n: number) => n.toLocaleString("en-US");

// The count: "$ 250 USDC" pill crosses the seam, then ≈ 6,500,000 VND counts up,
// with "example, estimated" and the simulated line under it.
const Count: React.FC<{ fromX: number; toX: number; seamX: number; top: number; align: "left" | "center"; left: number; width: number; size: number }> = ({
  fromX,
  toX,
  seamX,
  top,
  align,
  left,
  width,
  size,
}) => {
  const frame = useCurrentFrame();
  const { pillAtSec, crossAtSec } = release;
  const pillIn = interpolate(frame, [sec(pillAtSec), sec(pillAtSec + 0.4)], [0, 1], { ...clamp, easing: ease });
  const cross = interpolate(frame, [sec(crossAtSec), sec(crossAtSec + 0.6)], [0, 1], { ...clamp, easing: ease });
  const pillOut = interpolate(frame, [sec(crossAtSec + 0.4), sec(crossAtSec + 0.65)], [1, 0], clamp);
  const seam = interpolate(frame, [sec(pillAtSec), sec(pillAtSec + 0.3), sec(crossAtSec + 0.5), sec(crossAtSec + 0.9)], [0, 1, 1, 0], clamp);
  const countP = interpolate(frame, [sec(crossAtSec + 0.3), sec(crossAtSec + 0.3 + durations.count)], [0, 1], { ...clamp, easing: ease });
  const countIn = interpolate(frame, [sec(crossAtSec + 0.3), sec(crossAtSec + 0.6)], [0, 1], clamp);
  // Round to 10,000 while counting; land exactly on the target value.
  const value = countP >= 1 ? release.toValue : Math.round((release.toValue * countP) / 10000) * 10000;
  const pop = 1 + 0.04 * interpolate(frame, [sec(crossAtSec + 1.8), sec(crossAtSec + 2.0), sec(crossAtSec + 2.3)], [0, 1, 0], clamp);
  const pillX = fromX + (toX - fromX) * cross;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: seamX - 1,
          top: top - 60,
          width: 2,
          height: 320,
          opacity: seam,
          background: `linear-gradient(180deg, rgba(212,181,247,0) 0%, ${colors.lilac} 50%, rgba(212,181,247,0) 100%)`,
          boxShadow: `0 0 20px ${colors.orchid}`,
        }}
      />
      <div style={{ position: "absolute", left: pillX, top: top + 20, transform: `translateX(-50%) scale(${0.9 + 0.1 * pillIn})`, opacity: pillIn * pillOut }}>
        <GlassPill style={{ fontSize: 60, whiteSpace: "nowrap" }}>{release.fromLabel}</GlassPill>
      </div>
      <div style={{ position: "absolute", left, top, width, opacity: countIn, textAlign: align }}>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: size,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            fontVariantNumeric: "tabular-nums",
            color: colors.white,
            textShadow: "0 0 50px rgba(184,122,237,0.7)",
            transform: `scale(${pop})`,
            transformOrigin: align === "left" ? "0% 50%" : "50% 50%",
            whiteSpace: "nowrap",
          }}
        >
          {release.toPrefix}
          {formatVnd(value)}
          {release.toSuffix}
        </div>
        <SmallLine text={release.estimateNote} atSec={crossAtSec + 0.5} theme="dark" align={align} style={{ marginTop: 14, fontSize: 36 }} />
        <SmallLine text={release.simulatedNote} atSec={crossAtSec + 0.9} theme="dark" align={align} style={{ marginTop: 26 }} />
      </div>
    </>
  );
};

// Climax. The cursor slides "Slide to release" on the review screen, the released
// screen follows, then (ref-10 look) the glossy pill crosses the seam into the
// big VND count. Glow on the landing layer only.
export const Scene07Release: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const t = useSceneSec();
  const { scene } = props;
  const mode = frameMode(scene, props.footageExists);
  const enter = interpolate(frame, [0, sec(0.6)], [0, 1], { ...clamp, easing: ease });
  const glow = 0.8 + 0.7 * interpolate(frame, [sec(release.crossAtSec), sec(release.crossAtSec + 0.5)], [0, 1], clamp);

  if (mode === "ui" && scene.ui) {
    const ui = scene.ui;
    const swap = interpolate(t, [ui.swapSec ?? 99, (ui.swapSec ?? 99) + 0.3], [0, 1], clamp);
    const seamX = layout.phone.left - 70;
    // The phone steps back when the count starts; the count fills the left column.
    const recede = interpolate(frame, [sec(release.crossAtSec), sec(release.crossAtSec + 0.5)], [0, 1], { ...clamp, easing: ease });
    return (
      <AbsoluteFill>
        <Backdrop theme="dark" glow={glow} glowY={80} />
        <DeviceFrame kind="phone" camera={ui.camera} cursor={ui.cursor} enter={enter * (1 - 0.55 * recede)} scale={1 - 0.08 * recede} rotateY={-8}>
          {/* Video: the review countdown row is hidden (no approved wording, BRIEF 2.a). */}
          <div style={{ position: "absolute", inset: 0, isolation: "isolate" }}>
            <MilestoneReviewScreen slide={windowProgress(t, ui.slide)} hideCountdown />
          </div>
          {swap > 0 ? (
            <div style={{ position: "absolute", inset: 0, zIndex: 10, isolation: "isolate", opacity: swap }}>
              <MilestoneReleasedScreen variant="client" />
            </div>
          ) : null}
        </DeviceFrame>
        <Count fromX={layout.phone.left + 200} toX={layout.textLeft + 240} seamX={seamX} top={390} align="left" left={layout.textLeft} width={900} size={96} />
      </AbsoluteFill>
    );
  }

  const recede = interpolate(frame, [sec(release.pillAtSec - 0.3), sec(release.pillAtSec + 0.4)], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <Backdrop theme="dark" glow={glow} glowY={78} />
      <FootageFrame {...props} enter={enter * (1 - 0.82 * recede)} rotateX={12 + 8 * recede} scale={1 - 0.22 * recede} glow={1 - recede} />
      <Count fromX={960 - 330} toX={960 + 330} seamX={960} top={380} align="center" left={0} width={1920} size={typeScale.amountSize} />
    </AbsoluteFill>
  );
};
