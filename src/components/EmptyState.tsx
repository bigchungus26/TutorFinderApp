// ============================================================
// EmptyState — Part 2.1 + 2.17
// Softly pulsing accent circle with lucide icon, Fraunces h2,
// muted body, optional CTA button.
// ============================================================
import { motion, useReducedMotion } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { variants } from "@/lib/motion";

interface EmptyStateProps {
  icon: ElementType | LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, children, className = "" }: EmptyStateProps) {
  const reduced = useReducedMotion();

  const pulseAnim = reduced
    ? {}
    : {
        animate: { scale: [1, 1.04, 1] },
        transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const },
      };

  return (
    <motion.div
      variants={variants.fadeSlideUp}
      initial="hidden"
      animate="visible"
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      {/* Pulsing icon circle */}
      <motion.div
        {...pulseAnim}
        className="w-20 h-20 rounded-full bg-accent-light flex items-center justify-center mb-5"
        aria-hidden="true"
      >
        <Icon size={28} className="text-accent" />
      </motion.div>

      <h2 className="text-h2 text-foreground mb-2">{title}</h2>

      {description && (
        <p className="text-body text-ink-muted max-w-xs leading-relaxed mb-6">{description}</p>
      )}

      {children}

      {action && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={action.onClick}
          className="h-12 px-6 rounded-xl bg-accent text-accent-foreground text-body font-semibold mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
