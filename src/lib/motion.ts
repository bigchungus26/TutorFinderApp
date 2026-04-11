// ============================================================
// Tutr — Motion System (Part 1.4)
// Single source of truth for all animation values.
// Every animation respects OS prefers-reduced-motion via MotionConfig.
// ============================================================
import type { Variants, Transition } from "framer-motion";

// ── Spring presets ─────────────────────────────────────────────
export const springs = {
  snappy:  { type: "spring" as const, stiffness: 400, damping: 30 },
  smooth:  { type: "spring" as const, stiffness: 300, damping: 28 },
  bouncy:  { type: "spring" as const, stiffness: 500, damping: 25, mass: 0.8 },
  gentle:  { type: "spring" as const, stiffness: 200, damping: 20 },
} as const;

// ── Cubic-bezier easings ───────────────────────────────────────
export const easings = {
  standard:  [0.2, 0, 0, 1]   as [number, number, number, number],
  emphasized:[0.2, 0, 0, 1.2] as [number, number, number, number],
  enter:     [0, 0, 0.2, 1]   as [number, number, number, number],
  exit:      [0.4, 0, 1, 1]   as [number, number, number, number],
} as const;

// ── Duration tokens ────────────────────────────────────────────
export const durations = {
  instant: 0.1,
  fast:    0.15,
  base:    0.25,
  slow:    0.35,
  dramatic: 0.6,
} as const;

// ── Transition shorthands ──────────────────────────────────────
export const transitions = {
  fast:     { duration: durations.fast,    ease: easings.exit }    as Transition,
  standard: { duration: durations.base,    ease: easings.standard } as Transition,
  enter:    { duration: durations.base,    ease: easings.enter }    as Transition,
  slow:     { duration: durations.slow,    ease: easings.enter }    as Transition,
  spring:   springs.smooth                                          as Transition,
  snappy:   springs.snappy                                          as Transition,
  bouncy:   springs.bouncy                                          as Transition,
  // legacy compat
  emphasized: { duration: durations.base, ease: easings.emphasized } as Transition,
  springBouncy: springs.bouncy as Transition,
} as const;

// ── Reusable Framer Motion variants ───────────────────────────
export const variants = {
  // Core fades / slides
  fadeSlideUp: {
    hidden:  { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: transitions.enter },
    show:    { opacity: 1, y: 0, transition: transitions.enter },
    exit:    { opacity: 0, y: -4, transition: transitions.fast },
  } as Variants,

  fadeSlideDown: {
    hidden:  { opacity: 0, y: -8 },
    visible: { opacity: 1, y: 0, transition: transitions.enter },
    show:    { opacity: 1, y: 0, transition: transitions.enter },
    exit:    { opacity: 0, y: -4, transition: transitions.fast },
  } as Variants,

  fadeIn: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: transitions.standard },
    show:    { opacity: 1, transition: transitions.standard },
    exit:    { opacity: 0, transition: transitions.fast },
  } as Variants,

  scaleIn: {
    hidden:  { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: transitions.spring },
    show:    { opacity: 1, scale: 1, transition: transitions.spring },
    exit:    { opacity: 0, scale: 0.95, transition: transitions.fast },
  } as Variants,

  // Onboarding step navigation
  slideInFromRight: {
    hidden:  { opacity: 0, x: 32 },
    visible: { opacity: 1, x: 0, transition: transitions.standard },
    show:    { opacity: 1, x: 0, transition: transitions.standard },
    exit:    { opacity: 0, x: -24, transition: transitions.fast },
  } as Variants,

  slideInFromLeft: {
    hidden:  { opacity: 0, x: -32 },
    visible: { opacity: 1, x: 0, transition: transitions.standard },
    show:    { opacity: 1, x: 0, transition: transitions.standard },
    exit:    { opacity: 0, x: 24, transition: transitions.fast },
  } as Variants,

  // Stagger list container
  staggerChildren: {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.05 } },
    show:    { transition: { staggerChildren: 0.05 } },
  } as Variants,

  // Individual stagger item
  staggerItem: {
    hidden:  { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: transitions.enter },
  } as Variants,

  // Bottom sheet
  sheetIn: {
    hidden:  { y: "100%" },
    visible: { y: 0, transition: { ...springs.smooth } },
    exit:    { y: "100%", transition: transitions.fast },
  } as Variants,

  // SVG path draw (for success checkmark)
  pathDraw: {
    hidden:  { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  } as Variants,
} as const;

// ── Tab bar page transition (fade only for smoothness) ─────────
export const tabVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: transitions.standard },
  exit:    { opacity: 0, transition: transitions.fast },
};

// ── Reduced-motion-safe shimmer ────────────────────────────────
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
