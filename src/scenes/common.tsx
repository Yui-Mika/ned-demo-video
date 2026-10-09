import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { CameraKey, CursorSettings, Scene } from "../script";
import { KineticLine } from "../components/KineticLine";
import { Footage } from "../components/Footage";
import { Cursor } from "../components/Cursor";
import { PerspectiveFrame, FRAME_ASPECT } from "../components/PerspectiveFrame";
import { DeviceView, cameraAt } from "../components/DeviceView";
import { Chip, useAppear } from "../components/Bits";
import { colors, durations, easeTravel, fonts, layout, type as typeScale, video } from "../tokens";
import { useDrift } from "./time";

export type SceneProps = { scene: Scene; footageExists: boolean };

// What the device frame shows: the recording if it exists, else the real UI,
// else (no UI for this scene) the placeholder card.
export type FrameMode = "footage" | "ui" | "placeholder";
export const frameMode = (scene: Scene, footageExists: boolean): FrameMode =>
  footageExists ? "footage" : scene.ui ? "ui" : "placeholder";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Eased 0..1 progress of a [start, end] window at time t (s), with the travel curve.
// Used for sliders (the thumb moves exactly with the cursor drag), scrolls and the carousel.
export const windowProgress = (t: number, w?: [number, number]) =>
  w ? interpolate(t, w, [0, 1], { ...clamp, easing: easeTravel }) : 0;

export const useSceneSec = () => useCurrentFrame() / video.fps;

// The scene's text: headline beats, then small lines and chips under them.
// "column": left column at about 20% from the top (device scenes); "top": centred.
export const TextBlock: React.FC<{
  scene: Scene;
  placement: "column" | "top";
  width?: number;
  size?: number;
  mode?: "rise" | "fade";
  swap?: boolean; // beats replace each other in the same place
  top?: number;
}> = ({ scene, placement, width = 900, size = typeScale.headlineSize, mode = "rise", swap = false, top = layout.headlineTop }) => {
  const column = placement === "column";
  const align = column ? "left" : "center";
  const box: React.CSSProperties = column
    ? { position: "absolute", left: layout.textLeft, top, width }
    : { position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center" };
  return (
    <div style={box}>
      <div style={{ position: "relative" }}>
        {scene.beats.map((b, i) => (
          <KineticLine
            key={i}
            {...b}
            size={size}
            theme={scene.theme}
            mode={mode}
            align={align}
            style={swap && i > 0 ? { position: "absolute", left: 0, right: 0, top: 0 } : undefined}
          />
        ))}
      </div>
      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 20, alignItems: column ? "flex-start" : "center" }}>
        {(scene.small ?? []).map((s, i) => (
          <SmallLine key={`s${i}`} text={s.text} atSec={s.atSec} theme={scene.theme} align={align} mode={mode} />
        ))}
        {(scene.chips ?? []).map((c, i) => (
          <SceneChip key={`c${i}`} text={c.text} atSec={c.atSec} theme={scene.theme} mode={mode} />
        ))}
      </div>
    </div>
  );
};

export const SmallLine: React.FC<{
  text: string;
  atSec: number;
  theme: "dark" | "light";
  align?: "left" | "center";
  mode?: "rise" | "fade";
  style?: React.CSSProperties;
}> = ({ text, atSec, theme, align = "center", mode = "rise", style }) => {
  const a = useAppear(atSec, undefined, mode === "fade" ? 0 : 16);
  return (
    <div
      style={{
        fontFamily: fonts.body,
        fontWeight: 400,
        fontSize: typeScale.smallSize,
        lineHeight: 1.35,
        color: theme === "dark" ? colors.mutedOnDark : colors.mutedOnLight,
        textAlign: align,
        ...a,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

const SceneChip: React.FC<{ text: string; atSec: number; theme: "dark" | "light"; mode: "rise" | "fade" }> = ({ text, atSec, theme, mode }) => {
  const a = useAppear(atSec, undefined, mode === "fade" ? 0 : 16);
  return (
    <div style={a}>
      <Chip text={text} theme={theme} />
    </div>
  );
};

type Motion = {
  enter?: number; // 0..1
  rotateX?: number;
  rotateY?: number;
  scale?: number;
  glow?: number;
  rise?: number; // px the frame travels up while entering
};

export type ScreenLayer = { node: React.ReactNode; camera: CameraKey[]; opacity?: number };

// 0..1 progress of a 0.5 s screen swap starting at `at` (s).
export const swapProgress = (t: number, at?: number) =>
  at === undefined ? 0 : interpolate(t, [at, at + durations.screenSwap], [0, 1], { ...clamp, easing: easeTravel });

// Phone or laptop UI in a tilted frame on the right: a zoom crop of the flat screen.
// `layers`: screens stacked in order, each with its own camera. A swap is the next
// layer fading in over the previous one; both are opaque screens, so this gives the
// same pixels as a cross-dissolve (outgoing out while incoming in) with no dip to the
// frame colour. The previous layer is dropped once the next is fully in.
export const DeviceFrame: React.FC<
  Motion & {
    kind: "phone" | "laptop";
    camera: CameraKey[]; // the cursor's view (and the screen's, when `children` is used)
    layers?: ScreenLayer[];
    cursor?: CursorSettings | null;
    children?: React.ReactNode; // a single screen at native size
    overlay?: React.ReactNode; // in window coordinates (scan line)
    outside?: React.ReactNode;
    box?: { left: number; top: number; w: number; h: number };
  }
> = ({ kind, camera, layers, cursor, children, overlay, outside, box, enter = 1, rotateX = 6, rotateY = -7, scale = 1, glow = 1, rise = 120 }) => {
  const t = useSceneSec();
  const drift = useDrift();
  const b = box ?? (kind === "phone" ? layout.phone : layout.laptop);
  const native = kind === "phone" ? { w: 390, h: 844 } : { w: 1440, h: 2600 };
  const zoom = cameraAt(camera, t).zoom;
  const list: ScreenLayer[] = layers ?? [{ node: children, camera }];
  // Skip layers fully covered by a later, fully opaque one.
  const firstVisible = Math.max(0, ...list.map((l, i) => ((l.opacity ?? 1) >= 1 ? i : 0)));
  const win = { w: b.w, h: b.h };
  return (
    <PerspectiveFrame
      width={b.w}
      height={b.h}
      left={b.left}
      top={b.top}
      radius={kind === "phone" ? 44 : 20}
      rotateX={rotateX}
      rotateY={rotateY}
      scale={scale * drift}
      translateY={(1 - enter) * rise}
      opacity={enter}
      glow={glow * enter}
      outside={outside}
    >
      {list.map((l, i) =>
        i < firstVisible || (l.opacity ?? 1) <= 0 ? null : (
          <div key={i} style={{ position: "absolute", inset: 0, isolation: "isolate", opacity: l.opacity ?? 1 }}>
            <DeviceView native={native} window={win} camera={l.camera}>
              {l.node}
            </DeviceView>
          </div>
        ),
      )}
      {cursor ? (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <DeviceView native={native} window={win} camera={camera} transparent>
            <Cursor settings={cursor} width={1} height={1} size={46 / zoom} />
          </DeviceView>
        </div>
      ) : null}
      {overlay}
    </PerspectiveFrame>
  );
};

// The recording (or its placeholder) in a 16:9 tilted frame, centred under the headline.
export const FootageFrame: React.FC<SceneProps & Motion & { children?: React.ReactNode; outside?: React.ReactNode }> = ({
  scene,
  footageExists,
  children,
  outside,
  enter = 1,
  rotateX = 12,
  rotateY = 0,
  scale = 1,
  glow = 1,
  rise = 160,
}) => {
  const drift = useDrift();
  const W = layout.footage.w;
  const H = Math.round(W / FRAME_ASPECT);
  return (
    <PerspectiveFrame
      width={W}
      top={layout.footage.top}
      rotateX={rotateX}
      rotateY={rotateY}
      scale={scale * drift}
      translateY={(1 - enter) * rise}
      opacity={enter}
      glow={glow * enter}
      outside={outside}
    >
      {scene.footage ? <Footage sceneNum={scene.num} settings={scene.footage} exists={footageExists} /> : null}
      {children}
      {footageExists && scene.footageCursor ? <Cursor settings={scene.footageCursor} width={W} height={H} /> : null}
    </PerspectiveFrame>
  );
};

// Headline placement for the current mode: left column next to a device, or
// centred above the 16:9 footage frame.
export const textPlacement = (mode: FrameMode) => (mode === "ui" ? "column" : "top");
export const FOOTAGE_HEADLINE_TOP = 196; // 18% from the top

export { AbsoluteFill };
