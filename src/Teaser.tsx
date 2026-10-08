import React from "react";
import { AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import assets from "./assets.json";
import { scenes, type Scene } from "./script";
import { buildCues } from "./cues";
import { audio, colors, durations, sec, video } from "./tokens";
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

const XF = sec(durations.crossfade);

// Each scene after the first fades in over the previous one, which keeps
// playing underneath for the length of the dissolve.
const SceneSlot: React.FC<{ scene: Scene; first: boolean }> = ({ scene, first }) => {
  const frame = useCurrentFrame();
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
    return [sec(s.startSec), sec(s.startSec + len)] as const;
  });

const musicVolume = (f: number) => {
  const ramp = sec(durations.duckRamp);
  let duck = 0;
  for (const [a, b] of voWindows) {
    duck = Math.max(duck, interpolate(f, [a - ramp, a, b, b + ramp], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  }
  const edges = interpolate(f, [0, sec(0.5), video.durationInFrames - sec(1.2), video.durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (audio.musicVolume - (audio.musicVolume - audio.musicDuckedVolume) * duck) * edges;
};

export const Teaser: React.FC<TeaserProps> = ({ burnSubtitles }) => {
  const cues = buildCues(scenes, found.vo);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.night }}>
      {scenes.map((s, i) => {
        const from = sec(s.startSec);
        const last = i === scenes.length - 1;
        const dur = sec(s.endSec - s.startSec) + (last ? 0 : XF);
        return (
          <Sequence key={s.id} from={from} durationInFrames={dur} name={`${s.id} · ${s.name}`} premountFor={30}>
            <SceneSlot scene={s} first={i === 0} />
          </Sequence>
        );
      })}

      {found.music ? <Html5Audio src={staticFile("audio/music.mp3")} volume={musicVolume} /> : null}
      {scenes.map((s) =>
        found.vo[s.id]?.exists ? (
          <Sequence key={`vo-${s.id}`} from={sec(s.startSec)} name={`VO ${s.id}`} layout="none">
            <Html5Audio src={staticFile(`audio/vo/${s.id}.mp3`)} volume={audio.voVolume} />
          </Sequence>
        ) : null,
      )}

      {burnSubtitles ? <Subtitles cues={cues} /> : null}
    </AbsoluteFill>
  );
};
