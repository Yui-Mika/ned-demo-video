import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors, durations, ease, fonts, gradients, sec, video } from "../tokens";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Fade + small rise for supporting elements (chips, small lines, cards).
export const useAppear = (atSec: number, lenSec = durations.fade, rise = 16) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [sec(atSec), sec(atSec + lenSec)], [0, 1], { ...clamp, easing: ease });
  return { opacity: p, transform: `translateY(${(1 - p) * rise}px)` };
};

// Small honesty chip, e.g. "Demo on a test network".
export const Chip: React.FC<{ text: string; theme: "dark" | "light"; style?: React.CSSProperties }> = ({
  text,
  theme,
  style,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 22px",
      borderRadius: 999,
      fontFamily: fonts.display,
      fontWeight: 700,
      fontSize: 26,
      letterSpacing: "0.01em",
      color: theme === "dark" ? colors.lilac : colors.purple,
      background: theme === "dark" ? "rgba(42,11,77,0.7)" : colors.primaryTint,
      border: `1.5px solid ${theme === "dark" ? "rgba(212,181,247,0.55)" : "rgba(123,47,190,0.35)"}`,
      ...style,
    }}
  >
    <span style={{ width: 10, height: 10, borderRadius: 5, background: colors.orchid }} />
    {text}
  </div>
);

// Glass pill (STYLE): 135deg purple gradient, white inner highlight, outer glow.
export const GlassPill: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "26px 64px",
      borderRadius: 999,
      background: gradients.glassPill,
      boxShadow: "0 0 60px rgba(184,122,237,0.6), inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -10px 24px rgba(42,11,77,0.35)",
      border: "1.5px solid rgba(255,255,255,0.35)",
      color: colors.white,
      fontFamily: fonts.display,
      fontWeight: 700,
      ...style,
    }}
  >
    {children}
  </div>
);

// Thin purple scan line with a trailing band (about 12% of the frame height),
// passing top to bottom over the footage.
export const ScanLine: React.FC<{ atSec: number; height: number }> = ({ atSec, height }) => {
  const frame = useCurrentFrame();
  // The one linear motion in the video: the scan band moves at a constant speed.
  const p = interpolate(frame, [sec(atSec), sec(atSec + durations.scanPass)], [0, 1], clamp);
  if (p <= 0 || p >= 1) return null;
  const y = -0.12 * height + p * 1.12 * height;
  const band = 0.12 * height;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, height: band + 3, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          bottom: 3,
          background: "linear-gradient(180deg, rgba(184,122,237,0) 0%, rgba(184,122,237,0.28) 70%, rgba(184,122,237,0.55) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 3,
          background: colors.orchid,
          boxShadow: `0 0 16px 3px ${colors.orchid}`,
        }}
      />
    </div>
  );
};

// Four white corner brackets around a frame (scan frame look).
export const CornerBrackets: React.FC<{ opacity: number; gap?: number; len?: number }> = ({ opacity, gap = 28, len = 64 }) => {
  const b = "4px solid rgba(255,255,255,0.92)";
  const base: React.CSSProperties = { position: "absolute", width: len, height: len, opacity, filter: "drop-shadow(0 0 10px rgba(212,181,247,0.8))" };
  return (
    <>
      <div style={{ ...base, left: -gap, top: -gap, borderLeft: b, borderTop: b, borderTopLeftRadius: 14 }} />
      <div style={{ ...base, right: -gap, top: -gap, borderRight: b, borderTop: b, borderTopRightRadius: 14 }} />
      <div style={{ ...base, left: -gap, bottom: -gap, borderLeft: b, borderBottom: b, borderBottomLeftRadius: 14 }} />
      <div style={{ ...base, right: -gap, bottom: -gap, borderRight: b, borderBottom: b, borderBottomRightRadius: 14 }} />
    </>
  );
};

// Seconds since the scene started (inside a Sequence).
export const useSceneSec = () => useCurrentFrame() / video.fps;
