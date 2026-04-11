import { Skeleton } from "./Skeleton";

export function TutorCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-border p-4 flex gap-3.5">
      <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-32 mb-1.5" />
        <Skeleton className="h-3.5 w-24 mb-2.5" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-28 mt-2" />
      </div>
    </div>
  );
}
