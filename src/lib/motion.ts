// ============================================================
// Teachme — Motion Primitives
// Reusable Framer Motion variants and transitions.
// All values derived from DESIGN_SYSTEM.md tokens.
// Every variant respects prefers-reduced-motion via a runtime check.
// ============================================================

import { Variants, Transition } from "framer-motion";

// ── Check reduced motion preference ──────────────────────────
// This is used at render-time. Use the useReducedMotion() hook
// from framer-motion in components when possible; this export
// is for constructing variants where hooks can't be called.
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ── Transitions ───────────────────────────────────────────────
export const transitions = {
  fast: {
    duration: 0.15,
    ease: [0.2, 0, 0, 1],
  } as Transition,

  standard: {
    duration: 0.22,
    ease: [0.2, 0, 0, 1],
  } as Transition,

  emphasized: {
    duration: 0.32,
    ease: [0.2, 0, 0, 1.2],
  } as Transition,

  spring: {
    type: "spring",
    stiffness: 380,
    damping: 30,
  } as Transition,

  springBouncy: {
    type: "spring",
    stiffness: 500,
    damping: 28,
  } as Transition,
} as const;

// ── Variant factory ───────────────────────────────────────────
// Returns reduced-motion-safe variants: degrades to plain opacity fade.
function makeVariant(full: Variants): Variants {
  if (prefersReducedMotion()) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: transitions.fast },
      exit: { opacity: 0, transition: transitions.fast },
    };
  }
  return full;
}

// ── Core Variants ─────────────────────────────────────────────
export const variants = {
  fadeIn: makeVariant({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: transitions.standard },
    exit: { opacity: 0, transition: transitions.fast },
  }),

  fadeSlideUp: makeVariant({
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: transitions.standard },
    exit: { opacity: 0, y: -8, transition: transitions.fast },
  }),

  fadeSlideDown: makeVariant({
    hidden: { opacity: 0, y: -12 },
    visible: { opacity: 1, y: 0, transition: transitions.standard },
    exit: { opacity: 0, y: 8, transition: transitions.fast },
  }),

  scaleIn: makeVariant({
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: transitions.emphasized },
    exit: { opacity: 0, scale: 0.96, transition: transitions.fast },
  }),

  // For onboarding step forward navigation
  slideInFromRight: makeVariant({
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: transitions.standard },
    exit: { opacity: 0, x: -40, transition: transitions.fast },
  }),

  // For onboarding step back navigation
  slideInFromLeft: makeVariant({
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: transitions.standard },
    exit: { opacity: 0, x: 40, transition: transitions.fast },
  }),

  // Parent container for stagger
  staggerChildren: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
      },
    },
  } as Variants,

  // Child item for stagger lists
  staggerItem: makeVariant({
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: transitions.standard },
    exit: { opacity: 0, transition: transitions.fast },
  }),

  // Interactive press/hover (apply via whileTap/whileHover directly)
  pressable: {
    whileTap: { scale: 0.97 },
    whileHover: { scale: 1.01 },
  },

  // For bottom sheets and modals entering from bottom
  sheetIn: makeVariant({
    hidden: { opacity: 0, y: "100%" },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ...transitions.emphasized, type: "spring", stiffness: 300, damping: 32 },
    },
    exit: { opacity: 0, y: "100%", transition: transitions.fast },
  }),

  // For checkmark SVG path animation
  pathDraw: {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  } as Variants,
} as const;

// ── Tab transition (fade only, no slide, for tab bar) ─────────
export const tabVariants: Variants = prefersReducedMotion()
  ? {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: transitions.fast },
      exit: { opacity: 0, transition: transitions.fast },
    }
  : {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: transitions.standard },
      exit: { opacity: 0, transition: transitions.fast },
    };
