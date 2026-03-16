import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton shown while MachineDashboardPage waits for first telemetry data */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 md:p-8 max-w-[1400px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>

      {/* Stat Badges */}
      <div className="flex flex-wrap gap-2">
        {[80, 60, 70, 65].map((w, i) => (
          <Skeleton key={i} className={`h-8 w-${w === 80 ? "20" : w === 60 ? "16" : w === 70 ? "24" : "20"} rounded-full`} />
        ))}
      </div>

      {/* Cards grid */}
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <InstanceCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InstanceCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-2.5 w-2.5 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="h-3 w-16" />
      <div className="space-y-2 pt-1">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3 w-18" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
      <div className="border-t border-border pt-2">
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}
