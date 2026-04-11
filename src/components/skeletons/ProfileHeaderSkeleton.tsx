import { Skeleton } from "./Skeleton";

export function ProfileHeaderSkeleton() {
  return (
    <div className="flex flex-col items-center text-center mb-6">
      <Skeleton className="w-24 h-24 rounded-full mb-3" />
      <Skeleton className="h-7 w-40 mb-2" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  );
}
