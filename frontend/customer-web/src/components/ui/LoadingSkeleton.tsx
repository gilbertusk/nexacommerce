"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-shimmer rounded-xs ${className}`} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-surface hairline rounded-xs overflow-hidden">
      {/* Aspect 4:5 frame */}
      <Skeleton className="w-full aspect-[4/5]" />
      
      {/* Text rows */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-5 w-3/4" />
        <div className="mt-auto flex gap-2 pt-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/5" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${
            i === lines - 1 ? "w-2/3" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}
