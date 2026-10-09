import React from "react";
import { Sequence, useCurrentFrame } from "remotion";
import { Teaser } from "../Teaser";

// Dev only: frame i of this composition shows Teaser frame PROBE[i], for quick checks in the studio.
export const PROBE = [12, 79, 239, 293, 339, 489, 653, 789, 1100, 1539];
export const Probe: React.FC = () => {
  const i = useCurrentFrame();
  return (
    <Sequence from={i - (PROBE[i] ?? 0)} layout="absolute-fill">
      <Teaser burnSubtitles={false} />
    </Sequence>
  );
};
