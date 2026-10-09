// Renders the Teaser without ever overwriting an earlier output.
// Writes out/<name>-<yyyymmdd-hhmm>.mp4 (with -2, -3 ... if that minute is taken),
// then copies it to the "latest" file.
// Usage: node scripts/render.mjs full | preview | subs
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const kinds = {
  full: { name: "ned-teaser", latest: "latest.mp4", args: [] },
  // The preview has its own "latest" file so a half-resolution file is never mistaken for the final one.
  preview: { name: "ned-teaser-preview-960x540", latest: "latest-preview.mp4", args: ["--scale=0.5"] },
  subs: { name: "ned-teaser-subs", latest: "latest-subs.mp4", args: ['--props={"burnSubtitles":true}'] },
};
const kind = kinds[process.argv[2] ?? "full"];
if (!kind) {
  console.error(`render: unknown kind "${process.argv[2]}" (use full, preview or subs)`);
  process.exit(1);
}

const pad = (n) => String(n).padStart(2, "0");
const d = new Date();
const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;

mkdirSync("out", { recursive: true });
let out = `out/${kind.name}-${stamp}.mp4`;
for (let i = 2; existsSync(out); i++) out = `out/${kind.name}-${stamp}-${i}.mp4`;

const r = spawnSync(
  "npx",
  ["remotion", "render", "src/index.ts", "Teaser", out, "--codec=h264", "--audio-codec=aac", "--enforce-audio-track", ...kind.args],
  { stdio: "inherit", shell: process.platform === "win32" },
);
if (r.status !== 0 || !existsSync(out)) {
  console.error("render: failed, nothing copied");
  process.exit(r.status || 1);
}
copyFileSync(out, `out/${kind.latest}`);
console.log(`render: ${out} -> out/${kind.latest}`);
