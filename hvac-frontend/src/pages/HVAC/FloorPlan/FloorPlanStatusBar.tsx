import type { AhuHealthStatus } from "@/domain/ahu/getAhuHealth";

interface StatusCounts {
  OK: number;
  WARNING: number;
  ALARM: number;
  DISCONNECTED: number;
}

interface FloorPlanStatusBarProps {
  counts: StatusCounts;
  total: number;
  onStatusClick: (status: AhuHealthStatus) => void;
}

interface ChipConfig {
  status: AhuHealthStatus;
  label: string;
  dot: string;
  baseClass: string;
  activeClass: string;
}

const CHIPS: ChipConfig[] = [
  {
    status: "OK",
    label: "OK",
    dot: "bg-green-500",
    baseClass: "border-border text-muted-foreground hover:border-green-500/50 hover:text-green-400",
    activeClass: "border-green-500/60 bg-green-500/10 text-green-400",
  },
  {
    status: "WARNING",
    label: "Warning",
    dot: "bg-yellow-500",
    baseClass: "border-border text-muted-foreground hover:border-yellow-500/50 hover:text-yellow-400",
    activeClass: "border-yellow-500/60 bg-yellow-500/10 text-yellow-400",
  },
  {
    status: "ALARM",
    label: "Alarm",
    dot: "bg-red-500",
    baseClass: "border-border text-muted-foreground hover:border-red-500/50 hover:text-red-400",
    activeClass: "border-red-500/60 bg-red-500/10 text-red-400",
  },
  {
    status: "DISCONNECTED",
    label: "Offline",
    dot: "bg-gray-400",
    baseClass: "border-border text-muted-foreground hover:border-gray-500/50",
    activeClass: "border-gray-500/60 bg-gray-500/10 text-gray-400",
  },
];

export function FloorPlanStatusBar({
  counts,
  total,
  onStatusClick,
}: FloorPlanStatusBarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {CHIPS.map(({ status, label, dot, baseClass, activeClass }) => {
        const count = counts[status];
        const isActive = count > 0;
        return (
          <button
            key={status}
            onClick={() => isActive && onStatusClick(status)}
            disabled={!isActive}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors
              ${isActive ? activeClass : "border-border/40 text-muted-foreground/50 cursor-default"}
            `}
            title={isActive ? `Jump to first ${label} AHU` : undefined}
          >
            <span className={`h-2 w-2 rounded-full flex-shrink-0 ${isActive ? dot : "bg-muted-foreground/30"}`} />
            {count} {label}
          </button>
        );
      })}

      {/* Total count */}
      <span className="ml-auto text-xs text-muted-foreground">
        {total} AHU{total !== 1 ? "s" : ""} placed
      </span>
    </div>
  );
}
