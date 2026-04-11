// ============================================================
// StatBlock — Part 2.1
// Big Fraunces tabular number with small muted label.
// Composes with CountUp for animation.
// ============================================================
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatBlockProps {
  value: ReactNode;
  label: string;
  className?: string;
}

export function StatBlock({ value, label, className }: StatBlockProps) {
  return (
    <div className={cn("text-center", className)}>
      <div className="text-display-lg text-foreground font-tabular leading-none">{value}</div>
      <p className="text-caption text-ink-muted mt-1">{label}</p>
    </div>
  );
}
