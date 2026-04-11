// ============================================================
// Chip — Part 2.1
// Selected / unselected state, pressable.
// ============================================================
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { springs } from "@/lib/motion";

interface ChipProps {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function Chip({ selected, onClick, children, icon, className, disabled }: ChipProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={springs.snappy}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-body-sm font-medium",
        "border transition-colors duration-150",
        selected
          ? "bg-accent text-accent-foreground border-accent"
          : "bg-surface text-foreground border-border hover:border-accent hover:text-accent",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}
