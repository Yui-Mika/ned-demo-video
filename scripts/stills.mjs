// Renders one small still per scene, at the middle of the scene, to out/stills/.
// Usage: node --experimental-strip-types scripts/stills.mjs [sceneNumbers...]
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { scenes } from "../src/script.ts";

const only = process.argv.slice(2).map(Number);
mkdirSync("out/stills", { recursive: true });
for (const s of scenes) {
  if (only.length && !only.includes(s.num)) continue;
  const frame = Math.round(((s.startSec + s.endSec) / 2) * 30);
  const out = `out/stills/${s.id}-f${frame}.jpg`;
  const r = spawnSync("npx", ["remotion", "still", "src/index.ts", "Teaser", out, `--frame=${frame}`, "--scale=0.5", "--image-format=jpeg", "--log=error"], {
    stdio: "inherit",
    shell: true,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log(`still: ${out}`);
}
