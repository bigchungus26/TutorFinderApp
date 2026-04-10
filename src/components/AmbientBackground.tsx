import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function AmbientBackground({ universityTint }: { universityTint?: string }) {
  const reducedMotion = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  const blob1Color = "hsl(152 50% 90%)";
  const blob2Color = "hsl(35 80% 88%)";

  const blob1Animation = reducedMotion.current
    ? {}
    : {
        x: [-100, -60, -120, -80, -100],
        y: [-100, -140, -70, -110, -100],
      };

  const blob2Animation = reducedMotion.current
    ? {}
    : {
        x: [100, 60, 130, 80, 100],
        y: [100, 140, 70, 120, 100],
      };

  const transition1 = reducedMotion.current
    ? undefined
    : {
        duration: 22,
        ease: "linear" as const,
        repeat: Infinity,
        repeatType: "mirror" as const,
      };

  const transition2 = reducedMotion.current
    ? undefined
    : {
        duration: 20,
        ease: "linear" as const,
        repeat: Infinity,
        repeatType: "mirror" as const,
      };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {/* Blob 1 — accent-soft green, top-left */}
      <motion.div
        animate={blob1Animation}
        transition={transition1}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: blob1Color,
          filter: "blur(120px)",
          willChange: "transform",
          x: -100,
          y: -100,
        }}
      />

      {/* University tint overlay on blob1 */}
      {universityTint && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: universityTint,
            opacity: 0.15,
            filter: "blur(120px)",
            transform: "translate(-100px, -100px)",
          }}
        />
      )}

      {/* Blob 2 — warm peach, bottom-right */}
      <motion.div
        animate={blob2Animation}
        transition={transition2}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: blob2Color,
          filter: "blur(120px)",
          willChange: "transform",
          x: 100,
          y: 100,
        }}
      />
    </div>
  );
}
