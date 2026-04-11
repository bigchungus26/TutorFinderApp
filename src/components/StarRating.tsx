// ── StarRating ─────────────────────────────────────────────────
// Reusable star rating: interactive (tappable with spring animation)
// or readonly (supports fractional / partial stars via SVG clip).
import { useState, useId } from "react";
import { motion } from "framer-motion";
import { transitions } from "@/lib/motion";

interface StarRatingProps {
  value: number;           // 0–5; 0 means none selected
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;           // px, default 20
  className?: string;
}

// ── Readonly partial star ──────────────────────────────────────
function ReadonlyStar({
  fill,
  size,
  clipId,
}: {
  fill: number;   // 0–1
  size: number;
  clipId: string;
}) {
  const pct = Math.round(fill * 100);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={`${pct}%`} height="20" />
        </clipPath>
      </defs>
      {/* Outline (grey) */}
      <path
        d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.1l-4.94 2.6.94-5.49-4-3.9 5.53-.8z"
        fill="hsl(var(--hairline))"
        stroke="hsl(var(--hairline))"
        strokeWidth="0.5"
      />
      {/* Filled (accent) clipped to fill% */}
      <path
        d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.1l-4.94 2.6.94-5.49-4-3.9 5.53-.8z"
        fill="var(--accent)"
        stroke="var(--accent)"
        strokeWidth="0.5"
        clipPath={`url(#${clipId})`}
      />
    </svg>
  );
}

// ── Interactive star ───────────────────────────────────────────
function InteractiveStar({
  filled,
  hovered,
  size,
  onTap,
  onHover,
  onLeave,
}: {
  filled: boolean;
  hovered: boolean;
  size: number;
  onTap: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const active = filled || hovered;
  return (
    <motion.button
      type="button"
      aria-label={filled ? "Filled star" : "Empty star"}
      whileTap={{ scale: 1.3 }}
      transition={transitions.springBouncy}
      onClick={onTap}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{ lineHeight: 0, background: "none", border: "none", padding: 0, cursor: "pointer" }}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        aria-hidden="true"
        animate={{ scale: active ? 1.05 : 1 }}
        transition={transitions.spring}
      >
        <path
          d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.1l-4.94 2.6.94-5.49-4-3.9 5.53-.8z"
          fill={active ? "var(--accent)" : "hsl(var(--hairline))"}
          stroke={active ? "var(--accent)" : "hsl(var(--hairline))"}
          strokeWidth="0.5"
          style={{ transition: "fill 0.12s ease, stroke 0.12s ease" }}
        />
      </motion.svg>
    </motion.button>
  );
}

// ── Main component ─────────────────────────────────────────────
export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 20,
  className = "",
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0); // 1-5, 0 = none
  const baseId = useId();

  if (readonly) {
    const clamped = Math.min(Math.max(value, 0), 5);
    return (
      <div
        className={`inline-flex items-center gap-0.5 ${className}`}
        aria-label={`${clamped.toFixed(1)} out of 5 stars`}
        role="img"
      >
        {Array.from({ length: 5 }, (_, i) => {
          const fill = Math.min(Math.max(clamped - i, 0), 1);
          return (
            <ReadonlyStar
              key={i}
              fill={fill}
              size={size}
              clipId={`${baseId}-star-${i}`}
            />
          );
        })}
      </div>
    );
  }

  // Interactive
  const displayValue = hovered > 0 ? hovered : value;

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role="group"
      aria-label="Star rating"
      onMouseLeave={() => setHovered(0)}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const starNum = i + 1;
        return (
          <InteractiveStar
            key={starNum}
            filled={starNum <= displayValue}
            hovered={hovered > 0 && starNum <= hovered}
            size={size}
            onTap={() => onChange?.(starNum)}
            onHover={() => setHovered(starNum)}
            onLeave={() => setHovered(0)}
          />
        );
      })}
    </div>
  );
}
