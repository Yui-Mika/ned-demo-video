import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../tokens";
import type { Theme } from "../script";

// Landing-layer background. Dark: #06060E with a purple glow; light: #F4F4F6 to
// white with a pale lilac glow at the bottom edge. The glow always breathes so
// no frame is still for long.
export const Backdrop: React.FC<{ theme: Theme; glow?: number; glowY?: number }> = ({
  theme,
  glow = 1,
  glowY = 100,
}) => {
  const frame = useCurrentFrame();
  const pulse = 1 + 0.06 * Math.sin(frame / 22);
  const drift = 4 * Math.sin(frame / 37);

  if (theme === "light") {
    return (
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${colors.appBg} 0%, #FFFFFF 70%)` }}>
        <AbsoluteFill
          style={{
            background: `radial-gradient(60% 40% at ${50 + drift}% ${glowY + 6}%, ${colors.lilac} 0%, rgba(212,181,247,0.35) 45%, rgba(212,181,247,0) 75%)`,
            opacity: 0.85 * glow,
            transform: `scale(${pulse})`,
          }}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: colors.night }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(55% 45% at ${50 + drift}% ${glowY}%, rgba(123,47,190,0.75) 0%, rgba(42,11,77,0.6) 45%, rgba(6,6,14,0) 80%)`,
          opacity: glow,
          transform: `scale(${pulse})`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(30% 20% at ${50 - drift}% ${glowY + 4}%, rgba(184,122,237,0.45) 0%, rgba(184,122,237,0) 70%)`,
          opacity: glow,
        }}
      />
    </AbsoluteFill>
  );
};
