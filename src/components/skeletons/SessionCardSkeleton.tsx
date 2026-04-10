import { Skeleton } from "./Skeleton";

export function SessionCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-hairline p-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-28 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-pill" />
      </div>
      {/* Detail row */}
      <div className="flex gap-4">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-16" />
      </div>
    </div>
  );
}
