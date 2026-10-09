// Time dilation: every scene keeps its content, actions and timings in script.ts
// (seconds of the ORIGINAL 30 fps, 60 s cut) and is only stretched to a new length.
// Retune a scene by changing its number in TARGET_SEC; starts, the composition
// length, subtitles and VO cues all follow from this table.
import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";

export const FPS = 60; // output frame rate
export const ORIGINAL_FPS = 30; // frame rate the scene timings were written for

// Target scene lengths in seconds (original: 6 5 5 5 5 5 5 8 6 10 = 60).
export const TARGET_SEC: Record<string, number> = {
  scene01: 6,
  scene02: 5,
  scene03: 7.5,
  scene04: 7.5,
  scene05: 7.5,
  scene06: 7.5,
  scene07: 8,
  scene08: 12,
  scene09: 6,
  scene10: 10,
};

type Timed = { id: string; startSec: number; endSec: number };
export type Retimed<S> = S & { scale: number; origStartSec: number; origEndSec: number };

// The scenes on the new timeline: startSec/endSec in output seconds, scale = new / original length.
export const retime = <S extends Timed>(scenes: S[]): Retimed<S>[] => {
  let t = 0;
  return scenes.map((s) => {
    const orig = s.endSec - s.startSec;
    const len = TARGET_SEC[s.id] ?? orig;
    const out = { ...s, startSec: t, endSec: t + len, scale: len / orig, origStartSec: s.startSec, origEndSec: s.endSec };
    t += len;
    return out;
  });
};

// Scale of the scene being rendered (1 outside any scene, e.g. subtitles).
export const SceneScale = createContext(1);
export const useSceneScale = () => useContext(SceneScale);

// Fractional local frame in the ORIGINAL 30 fps timeline. Never rounded.
export const useSceneFrame = () => {
  const scale = useSceneScale();
  return useCurrentFrame() / ((scale * FPS) / ORIGINAL_FPS);
};
