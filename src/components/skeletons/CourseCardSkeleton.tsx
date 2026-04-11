import { Skeleton } from "./Skeleton";

export function CourseCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[140px] bg-surface rounded-xl border border-border p-3.5">
      {/* Accent bar */}
      <Skeleton className="w-full h-1 rounded-full mb-3" />
      {/* Code */}
      <Skeleton className="h-4 w-16 mb-1" />
      {/* Name */}
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
