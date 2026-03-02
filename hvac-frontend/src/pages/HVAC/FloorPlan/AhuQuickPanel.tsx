import { X, ExternalLink, Thermometer, Droplets, Wind, Zap, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { routes } from "@/router/routes";
import type { HvacTelemetry } from "@/types/telemetry";
import type { AhuHealthStatus } from "@/domain/ahu/getAhuHealth";

interface AhuQuickPanelProps {
  ahuId: string;
  plantId: string;
  label: string;
  status: AhuHealthStatus;
  telemetry: HvacTelemetry | null;
  isConnected: boolean;
  onClose: () => void;
}

const STATUS_BADGE: Record<AhuHealthStatus, string> = {
  OK: "bg-green-500/20 text-green-400 border-green-500/30",
  WARNING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  ALARM: "bg-red-500/20 text-red-400 border-red-500/30",
  DISCONNECTED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

function MetricRow({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number | boolean | undefined;
  unit?: string;
}) {
  if (value === undefined || value === null) return null;
  return (
    <div className="flex items-center justify-between gap-2 py-1 border-b border-border last:border-0">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xs font-mono font-medium">
        {String(value)}{unit ? ` ${unit}` : ""}
      </span>
    </div>
  );
}

export function AhuQuickPanel({
  ahuId,
  plantId,
  label,
  status,
  telemetry,
  isConnected,
  onClose,
}: AhuQuickPanelProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3 w-64 rounded-lg border border-border bg-card shadow-xl p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-sm">{label}</span>
          <span className="text-xs text-muted-foreground">{plantId}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 -mt-1" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={`text-xs ${STATUS_BADGE[status]}`}>
          {status}
        </Badge>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {isConnected
            ? <Wifi className="h-3 w-3 text-green-400" />
            : <WifiOff className="h-3 w-3 text-gray-400" />}
          {isConnected ? "Online" : "Offline"}
        </div>
      </div>

      {/* Metrics */}
      {telemetry ? (
        <div className="flex flex-col">
          <MetricRow
            icon={Thermometer}
            label="Temperature"
            value={telemetry.points.temperature?.value}
            unit={telemetry.points.temperature?.unit ?? "°C"}
          />
          <MetricRow
            icon={Droplets}
            label="Humidity"
            value={telemetry.points.humidity?.value}
            unit={telemetry.points.humidity?.unit ?? "%"}
          />
          <MetricRow
            icon={Wind}
            label="Airflow"
            value={telemetry.points.airflow?.value}
            unit={telemetry.points.airflow?.unit ?? "m³/h"}
          />
          <MetricRow
            icon={Zap}
            label="Power"
            value={telemetry.points.power?.value}
            unit={telemetry.points.power?.unit ?? "kW"}
          />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">No live data available</p>
      )}

      {/* Link to detail page */}
      <Button
        size="sm"
        variant="outline"
        className="w-full mt-1 gap-2"
        onClick={() => navigate(routes.hvac.ahuDetail(plantId, ahuId))}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        View Detail
      </Button>
    </div>
  );
}
