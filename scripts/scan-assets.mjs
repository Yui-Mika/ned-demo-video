// Writes src/assets.json: which optional footage and audio files exist, plus VO durations.
// Run before every still and render (npm scripts do this through `npm run prep`).
import { existsSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { scenes } from "../src/script.ts";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pub = path.join(root, "public");

// Remotion ships its own ffprobe; use it to read VO durations.
const probeDuration = (file) => {
  const res = spawnSync("npx", ["remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], {
    cwd: root,
    encoding: "utf8",
    shell: true,
  });
  const d = parseFloat((res.stdout || "").trim().split(/\s+/).pop());
  return Number.isFinite(d) ? Math.round(d * 1000) / 1000 : null;
};

const footage = {};
const vo = {};
for (const s of scenes) {
  footage[s.id] = s.footage ? existsSync(path.join(pub, s.footage.file)) : false;
  const voFile = path.join(pub, "audio", "vo", `${s.id}.mp3`);
  if (existsSync(voFile)) {
    const durationSec = probeDuration(voFile);
    vo[s.id] = { exists: true, durationSec };
    const len = s.endSec - s.startSec;
    if (durationSec && durationSec > len) {
      console.warn(`scan-assets: warning: ${s.id}.mp3 is ${durationSec}s, longer than the ${len}s scene`);
    }
  } else {
    vo[s.id] = { exists: false, durationSec: null };
  }
}

const assets = {
  footage,
  music: existsSync(path.join(pub, "audio", "music.mp3")),
  vo,
};

writeFileSync(path.join(root, "src", "assets.json"), JSON.stringify(assets, null, 2) + "\n");
const nFootage = Object.values(footage).filter(Boolean).length;
const nVo = Object.values(vo).filter((v) => v.exists).length;
console.log(`scan-assets: footage ${nFootage}/${scenes.filter((s) => s.footage).length}, music ${assets.music ? "yes" : "no"}, VO ${nVo}/${scenes.length} -> src/assets.json`);
