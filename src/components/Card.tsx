// ============================================================
// Card — Part 2.1
// Hairline border, no shadow by default.
// Pressable variant adds spring press + hover.
// ============================================================
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { springs } from "@/lib/motion";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Makes the card a pressable button with spring feedback */
  pressable?: boolean;
  onClick?: () => void;
  as?: "div" | "button" | "article";
}

export function Card({ children, className, pressable = false, onClick, as: Tag = "div" }: CardProps) {
  const base = cn(
    "bg-surface border border-border rounded-xl overflow-hidden",
    pressable && "cursor-pointer",
    className
  );

  if (pressable || onClick) {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.005 }}
        transition={springs.snappy}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        className={base}
      >
        {children}
      </motion.div>
    );
  }

  return <Tag className={base}>{children}</Tag>;
}

// ── Subcomponents ──────────────────────────────────────────────
Card.Header = function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-4 pt-4", className)}>{children}</div>;
};

Card.Body = function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-4 py-4", className)}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("px-4 pb-4 pt-3 border-t border-border mt-1", className)}>
      {children}
    </div>
  );
};
