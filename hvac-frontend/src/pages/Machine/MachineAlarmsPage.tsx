import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMachineTypes } from "@/context/MachineTypeContext";
import { useMachineTelemetry } from "@/hooks/useMachineTelemetry";
import { useDeviceHealth } from "@/hooks/useDeviceHealth";
import { useAcks } from "@/context/AckContext";
import { routes } from "@/router/routes";
import { toast } from "sonner";

export default function MachineAlarmsPage() {
  const { machineType: slug } = useParams<{ machineType: string }>();
  const navigate = useNavigate();
  const { machineTypes } = useMachineTypes();
  const { instances, isMachineConnected } = useMachineTelemetry(slug);
  const getHealth = useDeviceHealth(slug);
  const { isAcknowledged, addAck } = useAcks();

  const machineType = useMemo(
    () => machineTypes.find((mt) => mt.slug === slug),
    [machineTypes, slug],
  );

  const alarmItems = useMemo(() => {
    return instances
      .map((inst) => {
        const key = `${inst.plantId}-${inst.stationId}`;
        const isConn = isMachineConnected(key);
        const health = getHealth(inst.points, isConn);
        return { inst, health, isConn };
      })
      .filter(
        ({ health }) =>
          health.status === "ALARM" || health.status === "WARNING",
      )
      .sort((a, b) => {
        if (a.health.status === "ALARM" && b.health.status !== "ALARM") return -1;
        if (a.health.status !== "ALARM" && b.health.status === "ALARM") return 1;
        return 0;
      });
  }, [instances, getHealth, isMachineConnected]);

  if (!machineType) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Machine type not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(routes.machine.home(slug!))}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{machineType.name} Alarms</h1>
            <p className="text-sm text-muted-foreground">
              {alarmItems.length} active alert{alarmItems.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Alarm List */}
      {alarmItems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <p className="text-lg font-semibold">No active alarms</p>
            <p className="text-sm text-muted-foreground">
              All {machineType.name} instances are operating normally.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alarmItems.map(({ inst, health }) => {
            const acked = isAcknowledged(
              inst.plantId,
              inst.stationId,
              health.status as "ALARM" | "WARNING",
              slug,
            );
            return (
              <Card
                key={`${inst.plantId}-${inst.stationId}`}
                className={`border ${
                  health.status === "ALARM"
                    ? "border-destructive/50 bg-destructive/5"
                    : "border-yellow-500/50 bg-yellow-500/5"
                } ${health.status === "ALARM" && !acked ? "animate-pulse" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      {health.status === "ALARM" ? (
                        <XCircle className="w-5 h-5 text-destructive" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-semibold">{inst.stationId}</p>
                        <p className="text-xs text-muted-foreground">
                          Plant: {inst.plantId}
                        </p>
                      </div>
                      <Badge
                        variant={
                          health.status === "ALARM"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {health.status}
                      </Badge>
                      {health.badPoints > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {health.badPoints} bad point{health.badPoints > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1 text-xs">
                        <Clock className="w-3 h-3" />
                        {new Date(inst.timestamp).toLocaleString()}
                      </Badge>
                      {acked ? (
                        <Badge
                          variant="outline"
                          className="text-xs text-green-500 border-green-500/30"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Acknowledged
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            addAck(inst.plantId, inst.stationId, health.status as "ALARM" | "WARNING", "operator", slug);
                            toast.success(
                              `Alarm acknowledged: ${inst.stationId}`,
                            );
                          }}
                        >
                          Acknowledge
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          navigate(
                            routes.machine.detail(
                              slug!,
                              inst.plantId,
                              inst.stationId,
                            ),
                          )
                        }
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
