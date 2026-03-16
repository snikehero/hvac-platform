import type { DeviceEvent } from "@/types/device-event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  WifiOff,
  Wifi,
  Clock,
} from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

interface DeviceEventTimelineProps {
  events: DeviceEvent[];
  maxEvents?: number;
}

export function DeviceEventTimeline({
  events,
  maxEvents = 50,
}: DeviceEventTimelineProps) {
  const { t, tf } = useTranslation();
  const displayEvents = events.slice(0, maxEvents);

  if (displayEvents.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
          <p className="text-lg font-semibold">{t.deviceTimeline.noEvents}</p>
          <p className="text-sm text-muted-foreground">
            {t.deviceTimeline.noEventsDesc}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          {t.deviceTimeline.title}
          <Badge variant="outline" className="ml-auto font-mono">
            {tf(t.deviceTimeline.count, { count: displayEvents.length })}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {displayEvents.map((event, idx) => (
          <div
            key={idx}
            className="flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/30"
          >
            <EventIcon type={event.type} />

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="font-medium">{event.message}</p>
                <Badge variant={getEventBadgeVariant(event.type)}>
                  {event.type}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {new Date(event.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EventIcon({ type }: { type: string }) {
  const config: Record<string, { Icon: typeof XCircle; color: string }> = {
    ALARM: { Icon: XCircle, color: "text-destructive" },
    WARNING: { Icon: AlertTriangle, color: "text-yellow-500" },
    DISCONNECTED: { Icon: WifiOff, color: "text-muted-foreground" },
    RECONNECTED: { Icon: Wifi, color: "text-green-500" },
    OK: { Icon: CheckCircle2, color: "text-green-500" },
  };

  const { Icon, color } = config[type] ?? config.OK;
  return <Icon className={`w-5 h-5 ${color} mt-0.5`} />;
}

function getEventBadgeVariant(type: string): "destructive" | "secondary" | "default" | "outline" {
  if (type === "ALARM") return "destructive";
  if (type === "WARNING") return "secondary";
  if (type === "DISCONNECTED") return "outline";
  return "default";
}
