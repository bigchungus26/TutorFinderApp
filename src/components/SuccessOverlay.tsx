// ── SuccessOverlay ────────────────────────────────────────────
// Full-screen success animation: SVG checkmark + brief message.
// Auto-dismisses at 1.2s then calls onDismiss.
// Used for: booking confirmed, onboarding complete, request accepted.
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { variants } from "@/lib/motion";

interface SuccessOverlayProps {
  visible: boolean;
  title: string;
  description?: string;
  onDismiss: () => void;
}

export function SuccessOverlay({ visible, title, description, onDismiss }: SuccessOverlayProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, 1400);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center px-8 text-center"
          aria-live="assertive"
          role="alert"
        >
          {/* Checkmark circle */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 28, delay: 0.05 }}
            className="w-24 h-24 rounded-full bg-accent-light flex items-center justify-center mb-6"
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              aria-hidden="true"
            >
              <motion.path
                d="M10 25 L20 35 L38 15"
                stroke="hsl(152 60% 42%)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
              />
            </svg>
          </motion.div>

          <motion.h2
            variants={variants.fadeSlideUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="text-display-md text-ink mb-2"
          >
            {title}
          </motion.h2>
          {description && (
            <motion.p
              variants={variants.fadeSlideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.38 }}
              className="text-body-sm text-ink-muted"
            >
              {description}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── CardSuccessOverlay ─────────────────────────────────────────
// Smaller overlay for accept/decline actions on a card.
interface CardSuccessOverlayProps {
  visible: boolean;
  title: string;
  onDismiss: () => void;
}

export function CardSuccessOverlay({ visible, title, onDismiss }: CardSuccessOverlayProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, 1200);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 rounded-xl bg-accent-light/90 flex flex-col items-center justify-center z-10"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <motion.path
                d="M5 12 L10 17 L19 8"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
              />
            </svg>
          </motion.div>
          <p className="text-label text-accent font-semibold">{title}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
