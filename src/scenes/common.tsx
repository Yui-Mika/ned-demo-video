import React from "react";
import { AbsoluteFill } from "remotion";
import type { Scene } from "../script";
import { KineticLine } from "../components/KineticLine";
import { Footage } from "../components/Footage";
import { Cursor } from "../components/Cursor";
import { FRAME_ASPECT } from "../components/PerspectiveFrame";
import { colors, fonts, type as typeScale } from "../tokens";
import { useAppear } from "../components/Bits";

export type SceneProps = { scene: Scene; footageExists: boolean };

// The scene's beats. "stack": one line under the other; "swap": same place, one replaces the other.
export const Beats: React.FC<{
  scene: Scene;
  top: number;
  size?: number;
  layout?: "stack" | "swap";
  mode?: "rise" | "fade";
}> = ({ scene, top, size = typeScale.headlineSize, layout = "stack", mode = "rise" }) => {
  if (layout === "swap") {
    return (
      <>
        {scene.beats.map((b, i) => (
          <AbsoluteFill key={i} style={{ top, height: "auto", alignItems: "center" }}>
            <KineticLine {...b} size={size} theme={scene.theme} mode={mode} />
          </AbsoluteFill>
        ))}
      </>
    );
  }
  return (
    <AbsoluteFill style={{ top, height: "auto", alignItems: "center", flexDirection: "column", gap: 4 }}>
      {scene.beats.map((b, i) => (
        <KineticLine key={i} {...b} size={size} theme={scene.theme} mode={mode} />
      ))}
    </AbsoluteFill>
  );
};

export const SmallLine: React.FC<{ text: string; atSec: number; theme: "dark" | "light"; style?: React.CSSProperties }> = ({
  text,
  atSec,
  theme,
  style,
}) => {
  const a = useAppear(atSec);
  return (
    <div
      style={{
        fontFamily: fonts.body,
        fontWeight: 400,
        fontSize: typeScale.smallSize,
        color: theme === "dark" ? colors.mutedOnDark : colors.mutedOnLight,
        textAlign: "center",
        ...a,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

// Footage (or placeholder) plus the cursor, sized to the frame width.
export const FrameContent: React.FC<SceneProps & { width: number; children?: React.ReactNode }> = ({
  scene,
  footageExists,
  width,
  children,
}) => {
  const height = Math.round(width / FRAME_ASPECT);
  return (
    <>
      {scene.footage ? <Footage sceneNum={scene.num} settings={scene.footage} exists={footageExists} /> : null}
      {children}
      {scene.cursor ? <Cursor settings={scene.cursor} width={width} height={height} /> : null}
    </>
  );
};
