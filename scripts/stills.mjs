// Renders small stills to out/stills/. With no arguments: one per scene, at the middle of the scene.
// Arguments: scene numbers (3 7) or explicit frames (f285 f573).
// Usage: node --experimental-strip-types scripts/stills.mjs [3 7 | f285 ...]
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { scenes as originalScenes } from "../src/script.ts";
import { FPS, retime } from "../src/time.ts";

const scenes = retime(originalScenes); // output timeline, FPS frames

const args = process.argv.slice(2);
const frames = args.filter((a) => a.startsWith("f")).map((a) => Number(a.slice(1)));
const only = args.filter((a) => !a.startsWith("f")).map(Number);

const jobs = frames.length
  ? frames.map((frame) => {
      const s = scenes.find((x) => frame >= x.startSec * FPS && frame < x.endSec * FPS) ?? scenes[0];
      return { frame, name: `${s.id}-f${frame}` };
    })
  : scenes
      .filter((s) => !only.length || only.includes(s.num))
      .map((s) => {
        const frame = Math.round(((s.startSec + s.endSec) / 2) * FPS);
        return { frame, name: `${s.id}-f${frame}` };
      });

mkdirSync("out/stills", { recursive: true });
for (const { frame, name } of jobs) {
  const out = `out/stills/${name}.jpg`;
  const r = spawnSync("npx", ["remotion", "still", "src/index.ts", "Teaser", out, `--frame=${frame}`, "--scale=0.5", "--image-format=jpeg", "--log=error"], {
    stdio: "inherit",
    shell: true,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log(`still: ${out}`);
}
