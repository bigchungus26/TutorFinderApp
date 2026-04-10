// ── Skeleton primitive ────────────────────────────────────────
// Subtle shimmer animation. Compose to build skeleton screens.
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-surface/60 before:to-transparent",
        "before:animate-[shimmer_1.2s_ease-in-out_infinite]",
        className
      )}
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
