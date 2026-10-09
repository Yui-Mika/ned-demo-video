import { createContext, useContext } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { durations, easeTravel, video } from "../tokens";

// The current scene's length in seconds (set by Teaser for each scene).
export const SceneLength = createContext(6);

// Slow continuous camera drift: scale 1.00 to 1.04 over the scene, eased, so no frame is static.
export const useDrift = () => {
  const len = useContext(SceneLength);
  const t = useCurrentFrame() / video.fps;
  return 1 + durations.drift * interpolate(t, [0, len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeTravel });
};
