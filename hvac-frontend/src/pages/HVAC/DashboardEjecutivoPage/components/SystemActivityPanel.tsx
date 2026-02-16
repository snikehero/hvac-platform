/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTelemetry } from "@/hooks/useTelemetry";
import {
  AlertTriangle,
  WifiOff,
  Clock,
  ShieldCheck,
  Activity,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

type StabilityLevel = "STABLE" | "DEGRADED" | "UNSTABLE";

export function SystemActivityPanel() {
  const { events } = useTelemetry();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const FIVE_MIN = 5 * 60 * 1000;

    let recentCritical = 0;
    let recentDisconnects = 0;

    events.forEach((event) => {
      const ts = new Date(event.timestamp).getTime();

      if (now - ts <= FIVE_MIN) {
        if (event.type === "ALARM") recentCritical++;
        if (event.type === "DISCONNECTED") recentDisconnects++;
      }
    });

    const lastEvent = events[0];
    const lastEventSeconds = lastEvent
      ? Math.floor((now - new Date(lastEvent.timestamp).getTime()) / 1000)
      : null;

    const instabilityScore = recentCritical + recentDisconnects;

    const stability: StabilityLevel =
      instabilityScore === 0
        ? "STABLE"
        : instabilityScore < 3
          ? "DEGRADED"
          : "UNSTABLE";

    return {
      recentCritical,
      recentDisconnects,
      lastEventSeconds,
      stability,
      instabilityScore,
    };
  }, [events, tick]);

  const stabilityConfig = {
    STABLE: {
      icon: ShieldCheck,
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      label: "Stable",
      badge: "default" as const,
    },
    DEGRADED: {
      icon: AlertTriangle,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      label: "Degraded",
      badge: "secondary" as const,
    },
    UNSTABLE: {
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/30",
      label: "Unstable",
      badge: "destructive" as const,
    },
  };

  const config = stabilityConfig[stats.stability];
  const StabilityIcon = config.icon;

  return (
    <Card className="border backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            System Activity
          </CardTitle>

          <Badge variant={config.badge} className="font-mono">
            <StabilityIcon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Recent Critical Events */}
          <ActivityStat
            icon={AlertTriangle}
            label="Critical (5min)"
            value={stats.recentCritical}
            color="destructive"
          />

          {/* Recent Disconnects */}
          <ActivityStat
            icon={WifiOff}
            label="Disconnects (5min)"
            value={stats.recentDisconnects}
            color="warning"
          />

          {/* Last Event */}
          <ActivityStat
            icon={Clock}
            label="Last Event"
            value={
              stats.lastEventSeconds !== null
                ? stats.lastEventSeconds < 60
                  ? `${stats.lastEventSeconds}s ago`
                  : `${Math.floor(stats.lastEventSeconds / 60)}m ago`
                : "No events"
            }
            color="muted"
          />

          {/* Stability Score */}
          <ActivityStat
            icon={TrendingUp}
            label="Stability Score"
            value={`${Math.max(0, 100 - stats.instabilityScore * 10)}%`}
            color={stats.stability === "STABLE" ? "success" : "muted"}
          />
        </div>

        {/* Activity Timeline (últimos 5 eventos) */}
        {events.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border/50">
            <h4 className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Recent Events
            </h4>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {events.slice(0, 5).map((event, i) => (
                <EventRow key={`${event.timestamp}-${i}`} event={event} />
              ))}
            </div>

            {events.length > 5 && (
              <div className="text-xs text-muted-foreground text-center pt-2">
                +{events.length - 5} more events
              </div>
            )}
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent events</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== Subcomponents =====

interface ActivityStatProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: "destructive" | "warning" | "success" | "muted";
}

function ActivityStat({ icon: Icon, label, value, color }: ActivityStatProps) {
  const colorConfig = {
    destructive: {
      iconColor: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/30",
    },
    warning: {
      iconColor: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
    },
    success: {
      iconColor: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
    },
    muted: {
      iconColor: "text-muted-foreground",
      bg: "bg-muted",
      border: "border-border",
    },
  };

  const config = colorConfig[color];

  return (
    <div className={`p-3 rounded-lg border ${config.border} ${config.bg}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${config.iconColor}`} />
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
      <div className="text-lg font-black tabular-nums">{value}</div>
    </div>
  );
}

interface EventRowProps {
  event: {
    type: string;
    timestamp: string;
    plantId?: string;
    stationId?: string;
  };
}

function EventRow({ event }: EventRowProps) {
  const typeConfig = {
    ALARM: {
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    WARNING: {
      icon: AlertTriangle,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    DISCONNECTED: {
      icon: WifiOff,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  };

  const config = typeConfig[event.type as keyof typeof typeConfig] || {
    icon: Activity,
    color: "text-muted-foreground",
    bg: "bg-muted",
  };

  const EventIcon = config.icon;

  const timeAgo = getTimeAgo(event.timestamp);

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <div className={`p-1.5 rounded ${config.bg}`}>
        <EventIcon className={`w-3 h-3 ${config.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium truncate">
            {event.stationId || "Unknown"} - {event.plantId || "Unknown"}
          </span>
          <Badge variant="outline" className="text-xs">
            {event.type}
          </Badge>
        </div>
      </div>

      <div className="text-xs text-muted-foreground font-mono whitespace-nowrap">
        {timeAgo}
      </div>
    </div>
  );
}

// Helper function
function getTimeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
}
