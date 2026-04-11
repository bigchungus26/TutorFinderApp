// ============================================================
// Badge — Part 2.1
// Semantic variants: success, warning, info, neutral, danger.
// ============================================================
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "info" | "neutral" | "danger" | "accent";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info:    "bg-info/10 text-info",
  neutral: "bg-muted text-ink-muted",
  danger:  "bg-error/10 text-error",
  accent:  "bg-accent-light text-accent",
};

export function Badge({ variant = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-pill text-caption font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
