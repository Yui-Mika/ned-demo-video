// Writes out/subtitles.vi.srt from the VO lines in src/script.ts and the scene times.
// Run with: node --experimental-strip-types scripts/make-srt.mjs (npm run srt)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { scenes } from "../src/script.ts";
import { buildCues, toSrt } from "../src/cues.ts";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let vo = {};
try {
  vo = JSON.parse(readFileSync(path.join(root, "src", "assets.json"), "utf8")).vo ?? {};
} catch {
  // assets.json missing: cues fill each scene
}
const cues = buildCues(scenes, vo);
mkdirSync(path.join(root, "out"), { recursive: true });
writeFileSync(path.join(root, "out", "subtitles.vi.srt"), toSrt(cues), "utf8");
console.log(`make-srt: ${cues.length} cues -> out/subtitles.vi.srt`);
