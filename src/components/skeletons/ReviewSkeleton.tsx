import { Skeleton } from "./Skeleton";

export function ReviewSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-hairline p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
        <div className="flex-1">
          {/* Name + stars */}
          <div className="flex items-center justify-between mb-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          {/* Course + date */}
          <Skeleton className="h-3 w-32 mb-2.5" />
          {/* Comment body */}
          <Skeleton className="h-3.5 w-full mb-1.5" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>
      </div>
    </div>
  );
}
