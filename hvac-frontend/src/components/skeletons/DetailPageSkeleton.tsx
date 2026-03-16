import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton shown while MachineDetailPage waits for instance data */
export function DetailPageSkeleton() {
  return (
    <div className="space-y-6 p-6 md:p-8 max-w-[1400px] mx-auto animate-in fade-in duration-300">
      {/* Back button + header */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-24" />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>

      {/* Status banner */}
      <Skeleton className="h-16 w-full rounded-xl" />

      {/* Tabs */}
      <div className="flex gap-2">
        {[80, 70, 90, 85].map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-md" />
        ))}
      </div>

      {/* Metric cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      {/* History chart placeholder */}
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
