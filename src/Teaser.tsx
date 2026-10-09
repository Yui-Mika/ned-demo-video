import React from "react";
import { AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile } from "remotion";
import assets from "./assets.json";
import { scenes as originalScenes, type Scene } from "./script";
import { FPS, ORIGINAL_FPS, retime, SceneScale, useSceneFrame, type Retimed } from "./time";
import { buildCues } from "./cues";
import { audio, colors, durations, sec } from "./tokens";
import { Subtitles } from "./components/Subtitles";
import type { SceneProps } from "./scenes/common";
import { Scene01Hook } from "./scenes/Scene01Hook";
import { Scene02Wordmark } from "./scenes/Scene02Wordmark";
import { Scene03Brief } from "./scenes/Scene03Brief";
import { Scene04Accept } from "./scenes/Scene04Accept";
import { Scene05Lock } from "./scenes/Scene05Lock";
import { Scene06Submit } from "./scenes/Scene06Submit";
import { Scene07Release } from "./scenes/Scene07Release";
import { Scene08Quiet } from "./scenes/Scene08Quiet";
import { Scene09Status } from "./scenes/Scene09Status";
import { Scene10EndCard } from "./scenes/Scene10EndCard";

export type TeaserProps = { burnSubtitles: boolean };

type Assets = {
  footage: Record<string, boolean>;
  music: boolean;
  vo: Record<string, { exists: boolean; durationSec: number | null }>;
};
const found = assets as Assets;

// Scenes on the stretched timeline (src/time.ts); content and in-scene timings unchanged.
const scenes = retime(originalScenes);
const outFrames = (s: number) => Math.round(s * FPS);

const components: Record<string, React.FC<SceneProps>> = {
  scene01: Scene01Hook,
  scene02: Scene02Wordmark,
  scene03: Scene03Brief,
  scene04: Scene04Accept,
  scene05: Scene05Lock,
  scene06: Scene06Submit,
  scene07: Scene07Release,
  scene08: Scene08Quiet,
  scene09: Scene09Status,
  scene10: Scene10EndCard,
};

const XF = sec(durations.crossfade); // in original 30 fps frames

// Each scene after the first fades in over the previous one, which keeps
// playing underneath for the length of the dissolve (stretched with the incoming scene).
const SceneSlot: React.FC<{ scene: Scene; first: boolean }> = ({ scene, first }) => {
  const frame = useSceneFrame();
  const Comp = components[scene.id];
  const opacity = first ? 1 : interpolate(frame, [0, XF], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity }}>
      <Comp scene={scene} footageExists={Boolean(found.footage[scene.id])} />
    </AbsoluteFill>
  );
};

// VO windows in frames, for ducking the music.
const voWindows = scenes
  .filter((s) => found.vo[s.id]?.exists)
  .map((s) => {
    const len = found.vo[s.id].durationSec ?? s.endSec - s.startSec;
    return [outFrames(s.startSec), outFrames(s.startSec + len)] as const;
  });

const musicVolume = (f: number) => {
  const ramp = outFrames(durations.duckRamp);
  let duck = 0;
  for (const [a, b] of voWindows) {
    duck = Math.max(duck, interpolate(f, [a - ramp, a, b, b + ramp], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  }
  // The music bed plays as delivered (no trim, no fades); only the ducking changes its level.
  return audio.musicVolume - (audio.musicVolume - audio.musicDuckedVolume) * duck;
};

export const Teaser: React.FC<TeaserProps> = ({ burnSubtitles }) => {
  const cues = buildCues(scenes, found.vo);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.night }}>
      {scenes.map((s, i) => {
        const from = outFrames(s.startSec);
        const next: Retimed<Scene> | undefined = scenes[i + 1];
        // Stay on screen under the next scene for its (stretched) dissolve.
        const dur = outFrames(s.endSec - s.startSec) + (next ? Math.round((XF * next.scale * FPS) / ORIGINAL_FPS) : 0);
        return (
          <Sequence key={s.id} from={from} durationInFrames={dur} name={`${s.id} · ${s.name}`} premountFor={60}>
            <SceneScale.Provider value={s.scale}>
              <SceneSlot scene={s} first={i === 0} />
            </SceneScale.Provider>
          </Sequence>
        );
      })}

      {found.music ? <Html5Audio src={staticFile("audio/music.mp3")} volume={musicVolume} /> : null}
      {scenes.map((s) =>
        found.vo[s.id]?.exists ? (
          <Sequence key={`vo-${s.id}`} from={outFrames(s.startSec)} name={`VO ${s.id}`} layout="none">
            <Html5Audio src={staticFile(`audio/vo/${s.id}.mp3`)} volume={audio.voVolume} />
          </Sequence>
        ) : null,
      )}

      {burnSubtitles ? <Subtitles cues={cues} /> : null}
    </AbsoluteFill>
  );
};
