import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors, durations, ease, fonts, gradients, sec } from "../tokens";

type Props = {
  text: string;
  atSec: number;
  untilSec?: number;
  size: number;
  theme: "dark" | "light";
  accentLast?: number;
  weight?: number;
  align?: "left" | "center";
  mode?: "rise" | "fade"; // "fade": no slide or blur (disclosure beat, SPEC 14.4)
  style?: React.CSSProperties;
};

// Each word rises TRAVEL_EM under its mask while it fades in. The mask's bottom
// inset is deeper than the travel plus the deepest descender (y, g, p, j: about
// 0.3 em below the baseline), so no glyph is ever cut, at rest or mid-reveal
// (a cut "you" read as "uou").
const TRAVEL_EM = 0.45;
const MASK = { top: 0.06, side: 0.08, bottom: 0.85 };
const GAP = 0.05; // margin each side; with the side padding, 0.26 em between words
const FADE_PART = 0.6; // share of the rise used for the fade-in

// One beat of kinetic text: words rise one by one under a mask.
export const KineticLine: React.FC<Props> = ({
  text,
  atSec,
  untilSec,
  size,
  theme,
  accentLast = 0,
  weight = 500,
  align = "center",
  mode = "rise",
  style,
}) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  const start = sec(atSec);
  const stagger = sec(durations.wordStagger);
  const rise = sec(durations.wordRise);
  const exitLen = sec(durations.lineExit);
  const color = theme === "dark" ? colors.white : colors.ink;
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  return (
    <div
      style={{
        fontFamily: fonts.display,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.12,
        letterSpacing: "-0.02em",
        color,
        textAlign: align,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const f0 = start + i * stagger;
        const inP = interpolate(frame, [f0, f0 + rise], [0, 1], { ...clamp, easing: ease });
        const inFade = interpolate(frame, [f0, f0 + rise * FADE_PART], [0, 1], clamp);
        const e0 = untilSec === undefined ? null : sec(untilSec) + i * Math.round(stagger / 2);
        const outP = e0 === null ? 0 : interpolate(frame, [e0, e0 + exitLen], [0, 1], { ...clamp, easing: ease });
        const accent = i >= words.length - accentLast;
        const y = mode === "rise" ? (1 - inP - outP) * TRAVEL_EM : 0;
        const opacity = mode === "rise" ? inFade * (1 - outP) : inP * (1 - outP);
        const leftEdge = i === 0 && align === "left";
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              verticalAlign: "top",
              padding: `${MASK.top}em ${MASK.side}em ${MASK.bottom}em`,
              margin: `-${MASK.top}em ${GAP}em -${MASK.bottom}em ${leftEdge ? -MASK.side : GAP}em`,
              clipPath: "inset(0 0 0 0)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${y}em)`,
                opacity,
                ...(accent
                  ? {
                      backgroundImage: theme === "dark" ? gradients.accent : gradients.accentOnLight,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      // the painted box must include the descenders for background-clip: text
                      paddingBottom: "0.14em",
                      marginBottom: "-0.14em",
                    }
                  : null),
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};
