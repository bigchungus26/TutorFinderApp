import { Skeleton } from "./Skeleton";

export function SubjectTileSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-3">
      <Skeleton className="w-5 h-5 rounded-sm flex-shrink-0" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}
