import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import type { FootageSettings } from "../script";
import { colors, fonts, video } from "../tokens";

// Trimmed landing-page recording, or a clearly marked placeholder when the
// file is missing, so the render never fails.
export const Footage: React.FC<{ sceneNum: number; settings: FootageSettings; exists: boolean }> = ({
  sceneNum,
  settings,
  exists,
}) => {
  if (exists) {
    const { startSec, endSec, playbackRate } = settings;
    return (
      <AbsoluteFill>
        <OffthreadVideo
          src={staticFile(settings.file)}
          trimBefore={Math.round(startSec * video.fps)}
          durationInFrames={Math.max(1, Math.round((endSec - startSec) * video.fps))}
          playbackRate={playbackRate}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
    );
  }
  return <Placeholder sceneNum={sceneNum} settings={settings} />;
};

const Placeholder: React.FC<{ sceneNum: number; settings: FootageSettings }> = ({ sceneNum, settings }) => {
  const frame = useCurrentFrame();
  const x = 50 + 18 * Math.sin(frame / 40);
  const nn = String(sceneNum).padStart(2, "0");
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0C0A18",
        backgroundImage: [
          `radial-gradient(45% 60% at ${x}% 55%, rgba(123,47,190,0.55) 0%, rgba(42,11,77,0.35) 50%, rgba(12,10,24,0) 80%)`,
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        ].join(", "),
        backgroundSize: "100% 100%, 48px 48px, 48px 48px",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 32,
          whiteSpace: "nowrap",
          color: colors.lilac,
          letterSpacing: "0.04em",
          padding: "14px 28px",
          border: `2px dashed rgba(212,181,247,0.6)`,
          borderRadius: 12,
          background: "rgba(6,6,14,0.55)",
        }}
      >
        {`FOOTAGE · scene ${nn} · ${settings.label}`}
      </div>
      <div style={{ fontFamily: fonts.mono, fontSize: 22, color: "rgba(255,255,255,0.55)" }}>
        {`missing public/${settings.file} · ${settings.startSec}–${settings.endSec} s · ${settings.playbackRate}×`}
      </div>
    </AbsoluteFill>
  );
};
