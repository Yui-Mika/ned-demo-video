import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { useSceneFrame } from "../time";
import { Backdrop } from "../components/Backdrop";
import { Chip, useAppear } from "../components/Bits";
import { endCard, WORDMARK } from "../script";
import { colors, ease, fonts, gradients, sec, type as typeScale } from "../tokens";
import { KineticLine } from "../components/KineticLine";
import type { SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// A longer label (the Vietnamese one) is set slightly smaller so it stays on one
// line beside the badge; the card layout does not change.
const titleSize = (title: string) => (title.length > 20 ? 32 : 36);

const LinkCard: React.FC<{ title: string; url: string; badge: string; atSec: number }> = ({ title, url, badge, atSec }) => {
  const a = useAppear(atSec, 0.6, 24);
  return (
    <div
      style={{
        ...a,
        width: 680,
        padding: "26px 32px",
        borderRadius: 22,
        background: "#111020",
        border: "1.5px solid rgba(212,181,247,0.35)",
        boxShadow: "0 20px 60px rgba(6,6,14,0.6), inset 0 1px 0 rgba(255,255,255,0.12)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: titleSize(title), color: colors.white, whiteSpace: "nowrap" }}>{title}</div>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: 20,
            color: colors.lilac,
            padding: "6px 14px",
            borderRadius: 999,
            border: "1.5px solid rgba(212,181,247,0.5)",
            background: "rgba(42,11,77,0.6)",
          }}
        >
          {badge}
        </div>
      </div>
      <div style={{ fontFamily: fonts.mono, fontSize: 23, color: "rgba(255,255,255,0.75)", whiteSpace: "nowrap" }}>{url}</div>
    </div>
  );
};

// End card (BRIEF 7.2): dark #06060E with the purple glow, wordmark as text,
// headline, two link cards, honesty chip, footer. No third card, no logo file.
export const Scene10EndCard: React.FC<SceneProps> = ({ scene }) => {
  const frame = useSceneFrame();
  const wIn = interpolate(frame, [sec(0.2), sec(1.2)], [0, 1], { ...clamp, easing: ease });
  const glow = interpolate(frame, [0, sec(1.5)], [0.5, 1.15], clamp);
  const chip = scene.chips?.[0];
  const chipA = useAppear(chip?.atSec ?? 3.4);
  const footA = useAppear((chip?.atSec ?? 3.4) + 0.6);
  return (
    <AbsoluteFill>
      <Backdrop theme="dark" glow={glow} glowY={96} />
      <AbsoluteFill style={{ top: 130, height: "auto", alignItems: "center" }}>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: typeScale.wordmarkSize,
            lineHeight: 1,
            letterSpacing: "0.02em",
            color: colors.white,
            opacity: wIn,
            transform: `translateY(${(1 - wIn) * 30}px) scale(${0.94 + 0.06 * wIn})`,
            textShadow: "0 0 70px rgba(184,122,237,0.55)",
          }}
        >
          {WORDMARK.slice(0, -1)}
          <span style={{ backgroundImage: gradients.accent, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            {WORDMARK.slice(-1)}
          </span>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 360, height: "auto", alignItems: "center" }}>
        {scene.beats.map((b, i) => (
          <KineticLine key={i} {...b} size={typeScale.headlineSize} theme={scene.theme} />
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 500, height: "auto", flexDirection: "row", justifyContent: "center", alignItems: "flex-start", gap: 40 }}>
        {endCard.links.map((l, i) => (
          <LinkCard key={i} {...l} atSec={2.2 + i * 0.25} />
        ))}
      </AbsoluteFill>
      {chip ? (
        <AbsoluteFill style={{ top: 730, height: "auto", alignItems: "center" }}>
          <div style={chipA}>
            <Chip text={chip.text} theme="dark" />
          </div>
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ top: 830, height: "auto", alignItems: "center" }}>
        <div style={{ ...footA, fontFamily: fonts.body, fontSize: 26, color: colors.mutedOnDark, letterSpacing: "0.04em" }}>
          {endCard.footer}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
