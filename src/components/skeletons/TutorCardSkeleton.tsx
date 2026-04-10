import { Skeleton } from "./Skeleton";

export function TutorCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-hairline p-4 flex gap-3.5">
      {/* Avatar */}
      <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0">
        {/* Name */}
        <Skeleton className="h-4 w-32 mb-1.5" />
        {/* Major/year */}
        <Skeleton className="h-3.5 w-24 mb-2.5" />
        {/* Course chips */}
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-14 rounded-pill" />
          <Skeleton className="h-5 w-14 rounded-pill" />
          <Skeleton className="h-5 w-10 rounded-pill" />
        </div>
        {/* Rating */}
        <Skeleton className="h-3.5 w-28 mt-2" />
      </div>
      {/* Rate */}
      <Skeleton className="h-4 w-12 flex-shrink-0" />
    </div>
  );
}
