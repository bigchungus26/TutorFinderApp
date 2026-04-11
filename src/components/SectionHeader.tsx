// ============================================================
// SectionHeader — Part 2.1
// Overline label above Fraunces h2 section title.
// ============================================================
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  overline?: string;
  title: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ overline, title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between mb-4", className)}>
      <div>
        {overline && (
          <p className="text-overline text-ink-muted mb-0.5">{overline}</p>
        )}
        <h2 className="text-h2 text-foreground">{title}</h2>
      </div>
      {action && <div className="ml-3 pb-0.5">{action}</div>}
    </div>
  );
}
