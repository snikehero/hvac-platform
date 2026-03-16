import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Cpu,
  Maximize2,
  Minimize2,
  WifiOff,
  X,
} from "lucide-react";
import { useMachineTypes } from "@/context/MachineTypeContext";
import { useMachineTelemetry } from "@/hooks/useMachineTelemetry";
import { useDeviceHealth } from "@/hooks/useDeviceHealth";
import { STATUS_DOT } from "@/constants/status";
import { routes } from "@/router/routes";

type KioskView = "status" | "instances" | "alerts";
const VIEWS: KioskView[] = ["status", "instances", "alerts"];
const ROTATE_MS = 5000; // 5 seconds

export default function KioskPage() {
  const { machineType: slug } = useParams<{ machineType: string }>();
  const navigate = useNavigate();
  const { machineTypes } = useMachineTypes();
  const { instances, connected, isMachineConnected } =
    useMachineTelemetry(slug);
  const getHealth = useDeviceHealth(slug);

  const machineType = useMemo(
    () => machineTypes.find((mt) => mt.slug === slug),
    [machineTypes, slug],
  );

  const [viewIdx, setViewIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Compute health stats
  const stats = useMemo(() => {
    let ok = 0;
    let warning = 0;
    let alarm = 0;
    for (const inst of instances) {
      const isConn = isMachineConnected(`${inst.plantId}-${inst.stationId}`);
      const h = getHealth(inst.points, isConn);
      if (h.status === "OK") ok++;
      else if (h.status === "WARNING") warning++;
      else if (h.status === "ALARM") alarm++;
    }
    return { ok, warning, alarm, total: instances.length };
  }, [instances, getHealth, isMachineConnected]);

  const hasCritical = stats.alarm > 0;

  // Auto-rotation
  const advance = useCallback(() => {
    setViewIdx((i) => (i + 1) % VIEWS.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(advance, ROTATE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [paused, viewIdx, advance]);

  // Escape to exit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate(routes.machine.home(slug!));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, slug]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  const currentView = VIEWS[viewIdx];

  return (
    <div
      className="relative min-h-screen bg-background text-foreground overflow-hidden"
      style={{ fontSize: "18px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* CRITICAL overlay */}
      {hasCritical && (
        <div className="absolute inset-0 pointer-events-none z-50 border-4 border-destructive animate-pulse" />
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Cpu className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">{machineType?.name ?? slug}</span>
          {hasCritical && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/15 border border-destructive/40 text-destructive text-sm font-semibold animate-pulse">
              <Bell className="h-4 w-4" />
              {stats.alarm} ALARM{stats.alarm > 1 ? "S" : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* View indicators */}
          <div className="flex gap-2">
            {VIEWS.map((v, i) => (
              <button
                key={v}
                onClick={() => {
                  setViewIdx(i);
                  setPaused(true);
                }}
                className={`h-2 rounded-full transition-all ${
                  i === viewIdx
                    ? "w-6 bg-primary"
                    : "w-2 bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>

          {paused && (
            <span className="text-xs text-muted-foreground">Paused</span>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => navigate(routes.machine.home(slug!))}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
            title="Exit kiosk (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* View content */}
      <div className="flex-1 p-8">
        {currentView === "status" && (
          <StatusView
            stats={stats}
            connected={connected}
            machineName={machineType?.name ?? slug ?? ""}
          />
        )}
        {currentView === "instances" && (
          <InstancesView
            instances={instances}
            connected={connected}
            isMachineConnected={isMachineConnected}
            getHealth={getHealth}
          />
        )}
        {currentView === "alerts" && (
          <AlertsView
            instances={instances}
            isMachineConnected={isMachineConnected}
            getHealth={getHealth}
          />
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/50">
        Press Esc to exit · Mouse over to pause rotation ·{" "}
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

/* ===== Status View ===== */
function StatusView({
  stats,
  connected,
  machineName,
}: {
  stats: { ok: number; warning: number; alarm: number; total: number };
  connected: boolean;
  machineName: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10">
      <div className="text-center">
        <p className="text-muted-foreground text-lg">System Status</p>
        <h2 className="text-5xl font-black mt-1">{machineName}</h2>
        <div
          className={`mt-3 inline-flex items-center gap-2 text-sm font-medium ${connected ? "text-green-500" : "text-destructive"}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-destructive"}`}
          />
          {connected ? "Connected" : "Disconnected"}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-3xl">
        <KioskStatCard
          label="Total"
          count={stats.total}
          icon={<Activity className="h-8 w-8" />}
          color="text-primary"
          bg="bg-primary/10"
        />
        <KioskStatCard
          label="OK"
          count={stats.ok}
          icon={<CheckCircle2 className="h-8 w-8" />}
          color="text-green-500"
          bg="bg-green-500/10"
        />
        <KioskStatCard
          label="Warnings"
          count={stats.warning}
          icon={<AlertTriangle className="h-8 w-8" />}
          color="text-yellow-500"
          bg="bg-yellow-500/10"
        />
        <KioskStatCard
          label="Alarms"
          count={stats.alarm}
          icon={<Bell className="h-8 w-8" />}
          color="text-destructive"
          bg="bg-destructive/10"
        />
      </div>
    </div>
  );
}

function KioskStatCard({
  label,
  count,
  icon,
  color,
  bg,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <div className={`rounded-2xl p-6 ${bg} flex flex-col items-center gap-2`}>
      <div className={color}>{icon}</div>
      <span className={`text-5xl font-black tabular-nums ${color}`}>
        {count}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

/* ===== Instances View ===== */
type HealthFn = (
  points: Record<string, { value: unknown; quality?: string; unit?: string }>,
  isConnected?: boolean,
) => { status: string };

function InstancesView({
  instances,
  connected,
  isMachineConnected,
  getHealth,
}: {
  instances: {
    plantId: string;
    stationId: string;
    points: Record<string, { value: unknown; quality?: string; unit?: string }>;
    timestamp: string;
  }[];
  connected: boolean;
  isMachineConnected: (key: string) => boolean;
  getHealth: HealthFn;
}) {
  if (instances.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <WifiOff className="h-12 w-12 mr-4" />
        <span className="text-2xl">No instances connected</span>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 text-muted-foreground">
        Live Instances
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {instances.map((inst) => {
          const isConn =
            connected &&
            isMachineConnected(`${inst.plantId}-${inst.stationId}`);
          const health = getHealth(inst.points, isConn);
          const dot =
            STATUS_DOT[health.status as keyof typeof STATUS_DOT] ??
            STATUS_DOT.DISCONNECTED;
          return (
            <div
              key={`${inst.plantId}-${inst.stationId}`}
              className={`rounded-xl border p-4 ${
                health.status === "ALARM"
                  ? "border-destructive/50 bg-destructive/5"
                  : health.status === "WARNING"
                    ? "border-yellow-500/50 bg-yellow-500/5"
                    : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-3 w-3">
                  {health.status === "ALARM" && (
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dot} opacity-75`}
                    />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${dot}`}
                  />
                </span>
                <span className="font-bold text-base truncate">
                  {inst.stationId}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate">
                {inst.plantId}
              </p>
              <p
                className={`text-sm font-semibold mt-2 ${
                  health.status === "ALARM"
                    ? "text-destructive"
                    : health.status === "WARNING"
                      ? "text-yellow-500"
                      : "text-green-500"
                }`}
              >
                {health.status}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== Alerts View ===== */
function AlertsView({
  instances,
  isMachineConnected,
  getHealth,
}: {
  instances: {
    plantId: string;
    stationId: string;
    points: Record<string, { value: unknown; quality?: string; unit?: string }>;
    timestamp: string;
  }[];
  isMachineConnected: (key: string) => boolean;
  getHealth: HealthFn;
}) {
  const alerts = instances
    .map((inst) => {
      const isConn = isMachineConnected(`${inst.plantId}-${inst.stationId}`);
      const health = getHealth(inst.points, isConn);
      return { inst, health, isConn };
    })
    .filter(
      ({ health }) => health.status === "ALARM" || health.status === "WARNING",
    )
    .sort(
      (a, b) =>
        (a.health.status === "ALARM" ? -1 : 1) -
        (b.health.status === "ALARM" ? -1 : 1),
    );

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-green-500">
        <CheckCircle2 className="h-16 w-16" />
        <span className="text-3xl font-bold">All Systems Normal</span>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 text-muted-foreground">
        Active Alerts
      </h3>
      <div className="space-y-3 max-h-[70vh] overflow-y-auto">
        {alerts.map(({ inst, health }) => (
          <div
            key={`${inst.plantId}-${inst.stationId}`}
            className={`flex items-center gap-4 rounded-xl border p-5 ${
              health.status === "ALARM"
                ? "border-destructive/50 bg-destructive/5"
                : "border-yellow-500/50 bg-yellow-500/5"
            }`}
          >
            <div
              className={`text-2xl font-black w-24 shrink-0 ${
                health.status === "ALARM"
                  ? "text-destructive"
                  : "text-yellow-500"
              }`}
            >
              {health.status}
            </div>
            <div>
              <p className="text-xl font-bold">{inst.stationId}</p>
              <p className="text-sm text-muted-foreground font-mono">
                {inst.plantId}
              </p>
            </div>
            <div className="ml-auto text-sm text-muted-foreground">
              {new Date(inst.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
