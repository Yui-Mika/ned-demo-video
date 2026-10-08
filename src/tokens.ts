// Design tokens: colours, fonts, easing and motion durations.
// Scene start/end times live in script.ts (one place for wording and timing).
import { Easing } from "remotion";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceMono } from "@remotion/google-fonts/SpaceMono";

const subsets: ("latin" | "latin-ext" | "vietnamese")[] = ["latin", "latin-ext", "vietnamese"];

export const fonts = {
  display: loadSpaceGrotesk("normal", { weights: ["400", "500", "700"], subsets }).fontFamily,
  body: loadInter("normal", { weights: ["400", "600"], subsets }).fontFamily,
  mono: loadSpaceMono("normal", { weights: ["400"], subsets: ["latin", "latin-ext", "vietnamese"] }).fontFamily,
};

export const video = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 1800,
};

export const colors = {
  // Landing layer (SPEC 16.2 band palette)
  night: "#06060E",
  lilac: "#D4B5F7",
  orchid: "#B87AED",
  purple: "#7B2FBE",
  plum: "#2A0B4D",
  // App screens (SPEC 12.1); used for light scenes and cards
  appBg: "#F4F4F6",
  surface: "#FFFFFF",
  ink: "#111116",
  primary: "#7B2FBE",
  primaryTint: "#F2EAFB",
  white: "#FFFFFF",
  mutedOnDark: "rgba(255,255,255,0.62)",
  mutedOnLight: "rgba(17,17,22,0.58)",
};

export const gradients = {
  accent: `linear-gradient(90deg, ${colors.lilac} 0%, ${colors.purple} 100%)`,
  // darker run of the same purples, readable on the light scenes
  accentOnLight: `linear-gradient(90deg, ${colors.purple} 0%, ${colors.plum} 100%)`,
  band: `linear-gradient(0deg, ${colors.lilac} 0%, ${colors.orchid} 22%, ${colors.purple} 45%, ${colors.plum} 70%, ${colors.night} 100%)`,
  glassPill: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.orchid} 100%)`,
};

export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_CURVE = [0.16, 1, 0.3, 1] as const;

// Motion durations, in seconds
export const durations = {
  wordRise: 0.6, // one word rising under its mask
  wordStagger: 0.09, // delay between words
  lineExit: 0.4,
  fade: 0.5,
  crossfade: 0.4, // soft dissolve between scenes
  frameEnter: 0.9, // perspective frame rising in
  cursorTravel: 0.8,
  cursorPress: 0.15,
  ripple: 0.5,
  scanPass: 1.5,
  count: 1.5,
  duckRamp: 0.2,
};

export const audio = {
  musicVolume: 0.55,
  musicDuckedVolume: 0.16,
  voVolume: 1,
};

export const type = {
  hookSize: 88,
  headlineSize: 64,
  smallSize: 30,
  wordmarkSize: 180,
  amountSize: 132,
  subtitleSize: 38,
};

export const sec = (s: number) => Math.round(s * video.fps);
