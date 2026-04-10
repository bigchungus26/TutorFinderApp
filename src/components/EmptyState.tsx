// ── EmptyState ────────────────────────────────────────────────
// Reusable empty state with icon, title, description, optional CTA.
// Always use this instead of ad-hoc "No data" messages.
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { variants } from "@/lib/motion";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <motion.div
      variants={variants.fadeSlideUp}
      initial="hidden"
      animate="visible"
      className={`flex flex-col items-center justify-center py-20 px-8 text-center ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mb-5">
        <Icon size={28} className="text-accent" />
      </div>
      <h3 className="text-display-sm text-ink mb-2">{title}</h3>
      <p className="text-body-sm text-ink-muted leading-relaxed mb-6 max-w-[260px]">{description}</p>
      {action && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={action.onClick}
          className="h-11 px-6 rounded-lg border border-hairline text-ink text-label font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
