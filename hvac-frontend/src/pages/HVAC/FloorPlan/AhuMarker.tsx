import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  WifiOff,
} from "lucide-react";
import type { AhuHealthStatus } from "@/domain/ahu/getAhuHealth";

interface AhuMarkerProps {
  ahuId: string;
  plantId: string;
  label: string;
  /** Position as percentage of canvas dimensions */
  x: number;
  y: number;
  status: AhuHealthStatus;
  editMode: boolean;
  selected: boolean;
  onClick: () => void;
  /** Optional telemetry values for hover tooltip */
  temperature?: number;
  temperatureUnit?: string;
  humidity?: number;
  humidityUnit?: string;
}

const STATUS_COLORS: Record<AhuHealthStatus, string> = {
  OK: "bg-green-500 border-green-400",
  WARNING: "bg-yellow-500 border-yellow-400",
  ALARM: "bg-red-500 border-red-400",
  DISCONNECTED: "bg-gray-500 border-gray-400",
};

const STATUS_GLOW: Record<AhuHealthStatus, string> = {
  OK: "0 0 6px 2px rgba(34,197,94,0.35)",
  WARNING: "0 0 10px 3px rgba(234,179,8,0.55)",
  ALARM: "0 0 14px 5px rgba(239,68,68,0.65)",
  DISCONNECTED: "none",
};

const STATUS_BADGE: Record<AhuHealthStatus, string> = {
  OK: "bg-green-500/20 text-green-300 border-green-500/40",
  WARNING: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  ALARM: "bg-red-500/20 text-red-300 border-red-500/40",
  DISCONNECTED: "bg-gray-500/20 text-gray-400 border-gray-500/40",
};

const STATUS_ICON: Record<
  AhuHealthStatus,
  React.ComponentType<{ className?: string }>
> = {
  OK: CheckCircle2,
  WARNING: AlertTriangle,
  ALARM: AlertOctagon,
  DISCONNECTED: WifiOff,
};

export function AhuMarker({
  ahuId,
  plantId,
  label,
  x,
  y,
  status,
  editMode,
  selected,
  onClick,
  temperature,
  temperatureUnit = "°C",
  humidity,
  humidityUnit = "%",
}: AhuMarkerProps) {
  const id = `${plantId}::${ahuId}`;
  const [showTooltip, setShowTooltip] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: !editMode,
    data: { ahuId, plantId },
  });

  const markerPadding = status === "ALARM" ? "p-2.5" : "p-1.5";

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${x}%`,
    top: `${y}%`,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : selected ? 20 : 10,
    cursor: editMode ? (isDragging ? "grabbing" : "grab") : "pointer",
    userSelect: "none",
  };

  const colorClass = STATUS_COLORS[status];
  const StatusIcon = STATUS_ICON[status];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(editMode ? { ...listeners, ...attributes } : {})}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => !editMode && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="-translate-x-1/2 -translate-y-1/2"
    >
      {/* Hover tooltip — view mode only */}
      {showTooltip && !editMode && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 pointer-events-none"
          style={{ minWidth: 160 }}
        >
          <div className="rounded-lg border border-border bg-popover/95 backdrop-blur-sm shadow-xl px-3 py-2.5 flex flex-col gap-1.5">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-foreground truncate max-w-[110px]">
                {label}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${STATUS_BADGE[status]}`}
              >
                {status}
              </span>
            </div>

            {/* Plant ID */}
            <span className="text-[10px] text-muted-foreground">{plantId}</span>

            {/* Metrics */}
            {(temperature !== undefined || humidity !== undefined) && (
              <div className="flex gap-3 pt-0.5 border-t border-border/50">
                {temperature !== undefined && (
                  <div className="flex flex-col">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Temp</span>
                    <span className="text-xs font-mono font-medium text-foreground">
                      {temperature.toFixed(1)} {temperatureUnit}
                    </span>
                  </div>
                )}
                {humidity !== undefined && (
                  <div className="flex flex-col">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Humidity</span>
                    <span className="text-xs font-mono font-medium text-foreground">
                      {humidity.toFixed(1)} {humidityUnit}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Hint */}
            <span className="text-[9px] text-muted-foreground italic">Click for full details</span>
          </div>

          {/* Tooltip arrow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
            style={{ borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid hsl(var(--border))" }}
          />
        </div>
      )}

      {/* ALARM: animate-ping outer ring (radar wave) */}
      {status === "ALARM" && (
        <span
          className="absolute inset-0 rounded-full bg-red-500 opacity-75 animate-ping"
          style={{ transform: "scale(1.5)" }}
        />
      )}

      {/* WARNING: animate-pulse outer ring */}
      {status === "WARNING" && (
        <span
          className="absolute inset-0 rounded-full bg-yellow-500 opacity-50 animate-pulse"
          style={{ transform: "scale(1.6)" }}
        />
      )}

      {/* Marker body */}
      <div
        className={`relative flex flex-col items-center gap-0.5 rounded-full border-2 shadow-lg transition-all duration-150
          ${colorClass}
          ${markerPadding}
          ${selected ? "ring-2 ring-white ring-offset-1 ring-offset-transparent scale-110" : "hover:scale-105"}
          ${isDragging ? "opacity-80 scale-110" : ""}
        `}
        style={{ boxShadow: STATUS_GLOW[status] }}
      >
        <StatusIcon className="h-4 w-4 text-white" />
      </div>

      {/* Label */}
      <div className="absolute top-full left-1/2 mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground shadow border border-border/40">
        {label}
      </div>
    </div>
  );
}
