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
  mode?: "rise" | "fade"; // "fade": no slide or blur (disclosure beat, SPEC 14.4)
  style?: React.CSSProperties;
};

// One beat of kinetic text: words rise one by one under a mask.
export const KineticLine: React.FC<Props> = ({
  text,
  atSec,
  untilSec,
  size,
  theme,
  accentLast = 0,
  weight = 500,
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

  return (
    <div
      style={{
        fontFamily: fonts.display,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.12,
        letterSpacing: "-0.02em",
        color,
        textAlign: "center",
        ...style,
      }}
    >
      {words.map((w, i) => {
        const f0 = start + i * stagger;
        const inP = interpolate(frame, [f0, f0 + rise], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: ease,
        });
        const e0 = untilSec === undefined ? null : sec(untilSec) + i * Math.round(stagger / 2);
        const outP =
          e0 === null
            ? 0
            : interpolate(frame, [e0, e0 + exitLen], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: ease,
              });
        const accent = i >= words.length - accentLast;
        const y = mode === "rise" ? (1 - inP) * 110 - outP * 110 : 0;
        const opacity = mode === "rise" ? 1 : inP * (1 - outP);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              verticalAlign: "top",
              padding: "0.04em 0.06em 0.16em",
              margin: "-0.04em 0.07em -0.16em",
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${y}%)`,
                opacity,
                ...(accent
                  ? {
                      backgroundImage: theme === "dark" ? gradients.accent : gradients.accentOnLight,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
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
