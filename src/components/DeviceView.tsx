import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { CameraKey } from "../script";
import { ease, video } from "../tokens";

export type Camera = { zoom: number; x: number; y: number };

// Camera at time t (s) from keyframes: zoom and focus point (native px of the screen).
export const cameraAt = (keys: CameraKey[], t: number): Camera => {
  if (!keys.length) return { zoom: 1, x: 0, y: 0 };
  if (t <= keys[0].atSec) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (t < b.atSec) {
      const p = interpolate(t, [a.atSec, b.atSec], [0, 1], { easing: ease });
      return { zoom: a.zoom + (b.zoom - a.zoom) * p, x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p };
    }
  }
  return keys[keys.length - 1];
};

// Offset that puts the focus point at the window centre, clamped so the screen
// always covers the window (no empty edges), or centred when it is smaller.
const offset = (win: number, native: number, zoom: number, focus: number) => {
  const size = native * zoom;
  if (size <= win) return (win - size) / 2;
  return Math.min(0, Math.max(win - size, win / 2 - focus * zoom));
};

type Props = {
  native: { w: number; h: number }; // the screen's own size (phone 390x844, laptop 1440x900)
  window: { w: number; h: number }; // the visible window inside the frame
  camera: CameraKey[];
  children: React.ReactNode; // flat DOM screen at native size, plus overlays in native px
};

// A zoom crop of a flat UI screen: renders at native size, then scales and pans
// so the active area fills the window and key text is readable at 1080p.
export const DeviceView: React.FC<Props> = ({ native, window: win, camera, children }) => {
  const frame = useCurrentFrame();
  const cam = cameraAt(camera, frame / video.fps);
  const tx = offset(win.w, native.w, cam.zoom, cam.x);
  const ty = offset(win.h, native.h, cam.zoom, cam.y);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#F4F4F6" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: native.w,
          height: native.h,
          transformOrigin: "0 0",
          transform: `translate(${tx}px, ${ty}px) scale(${cam.zoom})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const useCamera = (keys: CameraKey[]) => cameraAt(keys, useCurrentFrame() / video.fps);
