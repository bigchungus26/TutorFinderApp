import { Skeleton } from "./Skeleton";

export function MessageSkeleton() {
  return (
    <div className="flex gap-2.5 px-5 py-2">
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-24 mb-1.5" />
        <Skeleton className="h-3.5 w-full mb-1" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>
    </div>
  );
}

export function MessageBubbleSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2 px-5`}>
      {!isOwn && <Skeleton className="w-7 h-7 rounded-full mr-2 flex-shrink-0 self-end" />}
      <div className={`max-w-[72%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <Skeleton className="h-10 w-52 rounded-xl" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
