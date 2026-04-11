// ============================================================
// PageTransition — Part 2.1
// Wraps a route's content in AnimatePresence fadeSlideUp.
// Usage: <PageTransition key={location.pathname}><Page /></PageTransition>
// ============================================================
import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { variants, transitions } from "@/lib/motion";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      variants={variants.fadeSlideUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={transitions.standard}
      className={`flex-1 flex flex-col ${className}`}
    >
      {children}
    </motion.div>
  );
}
