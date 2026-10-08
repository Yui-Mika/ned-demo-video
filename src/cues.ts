// Subtitle cues from the VO lines and scene times. Import-free so that
// scripts/make-srt.mjs (Node) and the burned-in subtitles (React) share it.

export type Cue = { startSec: number; endSec: number; text: string };

type SceneLike = { id: string; startSec: number; endSec: number; vo: string };
type VoInfo = Record<string, { exists: boolean; durationSec: number | null }>;

const MAX_CHARS = 64; // one cue should fit on two lines

// Split a VO line into sentences, then merge short neighbours back together.
const splitLine = (line: string): string[] => {
  // Split only at punctuation followed by a space, so "N.E.D." stays whole.
  const parts = line.split(/(?<=[.?!])\s+/).map((p) => p.trim()).filter(Boolean);
  const out: string[] = [];
  for (const p of parts) {
    const last = out[out.length - 1];
    if (last && last.length + p.length + 1 <= MAX_CHARS && (last.length < 24 || p.length < 24)) {
      out[out.length - 1] = `${last} ${p}`;
    } else {
      out.push(p);
    }
  }
  return out;
};

export const buildCues = (scenes: SceneLike[], vo: VoInfo = {}): Cue[] => {
  const cues: Cue[] = [];
  for (const s of scenes) {
    if (!s.vo) continue;
    const sceneLen = s.endSec - s.startSec;
    // With a VO file, cues follow its length; without one, they fill the scene
    // minus a short gap so neighbouring cues never touch.
    const known = vo[s.id]?.exists ? vo[s.id]?.durationSec : null;
    const span = known ? Math.min(known, sceneLen + 2) : sceneLen - 0.3;
    const start = s.startSec + 0.15;
    const parts = splitLine(s.vo);
    const total = parts.reduce((n, p) => n + p.length, 0);
    let t = start;
    for (const p of parts) {
      const d = (span - 0.15) * (p.length / total);
      cues.push({ startSec: t, endSec: t + d, text: p });
      t += d;
    }
  }
  return cues;
};

const pad = (n: number, w = 2) => String(n).padStart(w, "0");
const stamp = (sec: number) => {
  const ms = Math.round(sec * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms % 1000, 3)}`;
};

export const toSrt = (cues: Cue[]): string =>
  cues.map((c, i) => `${i + 1}\n${stamp(c.startSec)} --> ${stamp(c.endSec)}\n${c.text}\n`).join("\n");
