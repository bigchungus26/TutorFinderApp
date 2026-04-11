// ── Skeleton primitive ────────────────────────────────────────
// Shimmer animation. Compose to build skeleton screens.
// Reduced motion: falls back to static muted bg (no animation).
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("shimmer rounded-lg bg-muted", className)}
      aria-hidden="true"
    />
  );
}

interface SkeletonListProps<T extends React.ComponentType<Record<string, never>>> {
  count: number;
  component: T;
}

export function SkeletonList<T extends React.ComponentType<Record<string, never>>>({
  count,
  component: Component,
}: SkeletonListProps<T>) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </>
  );
}
