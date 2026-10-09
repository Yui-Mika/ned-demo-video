import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../tokens";

export const FRAME_ASPECT = 16 / 9;

type Props = {
  width: number;
  height?: number; // default: 16:9 of the width
  top: number;
  left?: number; // default: centred
  offsetX?: number;
  radius?: number;
  rotateX?: number; // 8 to 20 deg (STYLE)
  rotateY?: number; // -12 to 12 deg
  scale?: number;
  translateY?: number;
  opacity?: number;
  glow?: number; // 0..1, the soft purple glow behind the frame (landing layer)
  zoom?: { scale: number; x: number; y: number }; // camera zoom inside the frame (x,y in 0..1)
  children: React.ReactNode; // footage + overlays that sit on the recording
  outside?: React.ReactNode; // overlays around the frame (corner brackets)
};

// Footage in an angled-perspective frame with a thin light rim and a soft glow
// behind it. Glow stays outside the recording (never inside app screens).
export const PerspectiveFrame: React.FC<Props> = ({
  width,
  height: heightProp,
  top,
  left: leftProp,
  offsetX = 0,
  radius = 18,
  rotateX = 12,
  rotateY = 0,
  scale = 1,
  translateY = 0,
  opacity = 1,
  glow = 1,
  zoom,
  children,
  outside,
}) => {
  const height = heightProp ?? Math.round(width / FRAME_ASPECT);
  const left = (leftProp ?? (1920 - width) / 2) + offsetX;
  return (
    <AbsoluteFill style={{ perspective: 1200, perspectiveOrigin: `${left + width / 2}px ${top + height / 2}px` }}>
      <div
        style={{
          position: "absolute",
          left,
          top,
          width,
          height,
          opacity,
          transformStyle: "preserve-3d",
          transform: `translateY(${translateY}px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -90,
            borderRadius: 120,
            background: `radial-gradient(50% 50% at 50% 55%, rgba(184,122,237,0.75) 0%, rgba(123,47,190,0.45) 45%, rgba(42,11,77,0) 75%)`,
            filter: "blur(40px)",
            opacity: glow,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            overflow: "hidden",
            backgroundColor: colors.night,
            border: "1.5px solid rgba(255,255,255,0.38)",
            boxShadow: "0 40px 90px rgba(6,6,14,0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: zoom ? `scale(${zoom.scale})` : undefined,
              transformOrigin: zoom ? `${zoom.x * 100}% ${zoom.y * 100}%` : undefined,
            }}
          >
            {children}
          </div>
        </div>
        {outside}
      </div>
    </AbsoluteFill>
  );
};
