import { useState } from "react";
import { Wind, Gauge, Send, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCommands } from "@/hooks/useCommands";
import type { CommandRequest, CommandStatus } from "@/types/command";

interface CommandsPanelProps {
  plantId: string;
  stationId: string;
  currentFanStatus?: string;
  currentDamperPosition?: number;
}

function StatusBadge({ status }: { status: CommandStatus }) {
  if (status === "idle") return null;

  const config = {
    pending: {
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
      label: "Sending...",
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    success: {
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: "Success",
      className: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    error: {
      icon: <XCircle className="w-3 h-3" />,
      label: "Error",
      className: "bg-destructive/20 text-destructive border-destructive/30",
    },
    timeout: {
      icon: <Clock className="w-3 h-3" />,
      label: "Timeout",
      className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
  };

  const cfg = config[status];
  return (
    <Badge variant="outline" className={`flex items-center gap-1 text-xs ${cfg.className}`}>
      {cfg.icon}
      {cfg.label}
    </Badge>
  );
}

export function CommandsPanel({
  plantId,
  stationId,
  currentFanStatus,
  currentDamperPosition,
}: CommandsPanelProps) {
  const { sendCommand, status, lastResult, reset } = useCommands();
  const [damperValue, setDamperValue] = useState<number>(
    typeof currentDamperPosition === "number" ? currentDamperPosition : 50,
  );

  const isPending = status === "pending";

  function send(req: Omit<CommandRequest, "plantId" | "stationId">) {
    if (status !== "idle" && status !== "success" && status !== "error" && status !== "timeout") return;
    reset();
    sendCommand({ plantId, stationId, ...req });
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            Commands
          </CardTitle>
          <StatusBadge status={status} />
        </div>
        {lastResult?.message && status !== "pending" && (
          <p className="text-xs text-muted-foreground mt-1">{lastResult.message}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Fan Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Fan</span>
            </div>
            {currentFanStatus && (
              <Badge
                variant="outline"
                className={
                  currentFanStatus === "ON"
                    ? "border-green-500/50 text-green-400"
                    : "border-muted text-muted-foreground"
                }
              >
                {currentFanStatus}
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={currentFanStatus === "ON" ? "default" : "outline"}
              className="flex-1"
              disabled={isPending || currentFanStatus === "ON"}
              onClick={() => send({ command: "fan_status", value: "ON" })}
            >
              ON
            </Button>
            <Button
              size="sm"
              variant={currentFanStatus === "OFF" ? "destructive" : "outline"}
              className="flex-1"
              disabled={isPending || currentFanStatus === "OFF"}
              onClick={() => send({ command: "fan_status", value: "OFF" })}
            >
              OFF
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Damper Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Damper Position</span>
            </div>
            {currentDamperPosition !== undefined && (
              <Badge variant="outline" className="text-muted-foreground">
                Current: {currentDamperPosition}%
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={damperValue}
              disabled={isPending}
              onChange={(e) => setDamperValue(Number(e.target.value))}
              className="flex-1 h-2 rounded-full accent-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span className="text-sm font-mono w-10 text-right">{damperValue}%</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="w-full"
            disabled={isPending}
            onClick={() => send({ command: "damper_position", value: damperValue })}
          >
            <Send className="w-3 h-3 mr-2" />
            Set Damper to {damperValue}%
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
