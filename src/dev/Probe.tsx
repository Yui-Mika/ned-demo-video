import React from "react";
import { Sequence, useCurrentFrame } from "remotion";
import { Teaser } from "../Teaser";
import { sec } from "../tokens";

// Dev only: frame i of this composition shows the Teaser at PROBE_SEC[i] seconds, for quick checks in the studio.
export const PROBE_SEC = [8.0, 20.0, 27.0, 35.0, 42.3, 44.8, 49.0, 52.0, 56.0, 63.0];
export const PROBE = PROBE_SEC.map(sec);
export const Probe: React.FC = () => {
  const i = useCurrentFrame();
  return (
    <Sequence from={i - (PROBE[i] ?? 0)} layout="absolute-fill">
      <Teaser burnSubtitles={false} />
    </Sequence>
  );
};
