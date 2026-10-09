import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { CursorSettings } from "../script";
import { durations, ease, video } from "../tokens";

type Pt = { x: number; y: number };
const lerp = (a: Pt, b: Pt, p: number): Pt => ({ x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p });
const prog = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

// Where the cursor is, whether it is pressed, and when clicks happened, at time t (s).
const cursorState = (c: CursorSettings, t: number) => {
  let pos: Pt = c.from;
  let pressed = 0;
  const presses: number[] = [];
  let free = -Infinity; // time when the previous gesture ended
  for (const tg of c.targets) {
    const target = { x: tg.x, y: tg.y };
    const travelStart = Math.max(free, tg.atSec - durations.cursorTravel);
    presses.push(tg.atSec);
    if (t < travelStart) break;
    if (t < tg.atSec) {
      pos = lerp(pos, target, prog(t, travelStart, tg.atSec));
      break;
    }
    pos = target;
    const pressEnd = tg.atSec + durations.cursorPress;
    if (tg.action === "drag" && tg.dragTo) {
      const dragEnd = pressEnd + (tg.dragSec ?? 0.6);
      if (t < dragEnd + 0.1) pressed = Math.max(pressed, prog(t, tg.atSec, pressEnd));
      if (t < pressEnd) break;
      if (t < dragEnd) {
        pos = lerp(target, tg.dragTo, prog(t, pressEnd, dragEnd));
        break;
      }
      pos = tg.dragTo;
      free = dragEnd + 0.1;
    } else {
      if (t < pressEnd) pressed = interpolate(t, [tg.atSec, tg.atSec + 0.05, pressEnd], [0, 1, 0]);
      free = pressEnd;
    }
  }
  return { pos, pressed, presses };
};

// Animated SVG pointer hand: travels with an ease-out, presses (scale 0.92 for
// 0.15 s) and leaves a faint ripple ring. Targets are multiplied by width and
// height: fractions of the footage frame, or screen pixels with width = height = 1.
export const Cursor: React.FC<{ settings: CursorSettings; width: number; height: number; size?: number }> = ({
  settings,
  width,
  height,
  size = 46,
}) => {
  const frame = useCurrentFrame();
  const t = frame / video.fps;
  const { pos, pressed, presses } = cursorState(settings, t);
  const firstMove = Math.max(0, (settings.targets[0]?.atSec ?? 0) - durations.cursorTravel - 0.3);
  const out = settings.outSec === undefined ? 0 : prog(t, settings.outSec, settings.outSec + 0.25);
  const appear = prog(t, firstMove, firstMove + 0.3) * (1 - out);
  const x = pos.x * width;
  const y = pos.y * height;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: appear }}>
      {presses.map((p, i) => {
        const r = prog(t, p, p + durations.ripple);
        if (t < p || r >= 1) return null;
        const d = (18 + r * 90) * (size / 46);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: settings.targets[i].x * width - d / 2,
              top: settings.targets[i].y * height - d / 2,
              width: d,
              height: d,
              borderRadius: "50%",
              border: `${3 * (size / 46)}px solid rgba(255,255,255,0.9)`,
              boxShadow: "0 0 18px rgba(184,122,237,0.8)",
              opacity: 0.7 * (1 - r),
            }}
          />
        );
      })}
      <svg
        width={size}
        height={size * 1.3}
        viewBox="0 0 40 52"
        style={{
          position: "absolute",
          // the fingertip (16.5, 3) sits on the target
          left: x - (16.5 / 40) * size,
          top: y - (3 / 52) * size * 1.3,
          transform: `scale(${1 - 0.08 * pressed})`,
          transformOrigin: "41% 6%",
          filter: "drop-shadow(0 4px 6px rgba(6,6,14,0.45))",
          overflow: "visible",
        }}
      >
        <g fill="#FFFFFF" stroke="#111116" strokeWidth={2.2} strokeLinejoin="round">
          <rect x={12} y={2} width={9} height={28} rx={4.5} />
          <rect x={20.5} y={16} width={8} height={17} rx={4} />
          <rect x={28} y={18.5} width={7.5} height={15} rx={3.75} />
          <rect x={34.5} y={22} width={5.5} height={12} rx={2.75} />
          <path d="M12 26 L12 30 L7 25 C4.5 22.5 1 25 3 28.5 L12 42 C14 46 17 50 23 50 L31 50 C36.5 50 40 46 40 40 L40 30 L12 30 Z" />
        </g>
        <g stroke="#111116" strokeWidth={1.6} strokeLinecap="round">
          <line x1={20.5} y1={31} x2={20.5} y2={36} />
          <line x1={28} y1={32} x2={28} y2={36} />
          <line x1={34.5} y1={32} x2={34.5} y2={35} />
        </g>
      </svg>
    </div>
  );
};
