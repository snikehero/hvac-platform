import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton shown while ExecutiveDashboardPage waits for data */
export function ExecutiveSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 -m-6 p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-64 bg-white/10" />
        <Skeleton className="h-4 w-32 bg-white/10" />
      </div>

      {/* Hero status card */}
      <Skeleton className="h-48 w-full rounded-2xl bg-white/10" />

      {/* Plant panel + activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        <div className="xl:col-span-2">
          <Skeleton className="h-56 w-full rounded-xl bg-white/10" />
        </div>
        <div>
          <Skeleton className="h-56 w-full rounded-xl bg-white/10" />
        </div>
      </div>

      {/* KPI widgets */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl bg-white/10" />
        ))}
      </div>

      {/* Heat map */}
      <Skeleton className="mt-8 h-48 w-full rounded-xl bg-white/10" />

      {/* Instance cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl bg-white/10" />
        ))}
      </div>
    </div>
  );
}
