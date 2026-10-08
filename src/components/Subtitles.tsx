import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { Cue } from "../cues";
import { fonts, type as typeScale, video } from "../tokens";

// Burned-in Vietnamese subtitles (only when the burnSubtitles prop is true).
export const Subtitles: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const t = frame / video.fps;
  const cue = cues.find((c) => t >= c.startSec && t < c.endSec);
  if (!cue) return null;
  const opacity = interpolate(t, [cue.startSec, cue.startSec + 0.12, cue.endSec - 0.12, cue.endSec], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 34 }}>
      <div
        style={{
          maxWidth: 1400,
          opacity,
          padding: "10px 26px 12px",
          borderRadius: 12,
          background: "rgba(6,6,14,0.78)",
          color: "#FFFFFF",
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize: typeScale.subtitleSize,
          lineHeight: 1.3,
          textAlign: "center",
        }}
      >
        {cue.text}
      </div>
    </AbsoluteFill>
  );
};
