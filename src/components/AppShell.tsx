// ============================================================
// AppShell — Part 2.1
// Root wrapper: noise texture bg, safe-area padding, phone frame.
// ============================================================
import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  /** Extra classes on the root div */
  className?: string;
}

export function AppShell({ children, className = "" }: AppShellProps) {
  return (
    <div className={`relative min-h-svh flex flex-col bg-background ${className}`}>
      {/* Noise texture overlay */}
      <div className="noise-bg" aria-hidden="true" />
      {/* Content sits above noise (z-10+) */}
      <div className="relative z-10 flex flex-col flex-1">
        {children}
      </div>
    </div>
  );
}
