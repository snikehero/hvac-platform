import { useEffect, useRef, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { useMachineTelemetry } from "@/hooks/useMachineTelemetry";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SignalLevel = "live" | "connected" | "slow" | "disconnected";

const LIVE_THRESHOLD_MS = 5_000;
const SLOW_THRESHOLD_MS = 30_000;

const LEVEL_CONFIG: Record<
  SignalLevel,
  { dot: string; text: string; border: string; bg: string; label: string; icon: typeof Wifi }
> = {
  live: {
    dot: "bg-green-500",
    text: "text-green-500",
    border: "border-green-500/30",
    bg: "bg-green-500/5",
    label: "LIVE",
    icon: Wifi,
  },
  connected: {
    dot: "bg-green-400/70",
    text: "text-green-400",
    border: "border-border",
    bg: "bg-muted/40",
    label: "EN LÍNEA",
    icon: Wifi,
  },
  slow: {
    dot: "bg-yellow-400",
    text: "text-yellow-400",
    border: "border-yellow-400/30",
    bg: "bg-yellow-400/5",
    label: "LENTO",
    icon: Wifi,
  },
  disconnected: {
    dot: "bg-destructive",
    text: "text-destructive",
    border: "border-destructive/30",
    bg: "bg-destructive/5",
    label: "SIN CONEXIÓN",
    icon: WifiOff,
  },
};

function formatAge(ms: number): string {
  if (ms < 1000) return "<1s";
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s`;
  return `${Math.floor(ms / 60_000)}m`;
}

export function ConnectionIndicator() {
  const { connected, allMachineTelemetry } = useMachineTelemetry();

  // Track the timestamp of the last telemetry update
  const lastSeenRef = useRef<number | null>(null);
  const prevTelemetryRef = useRef(allMachineTelemetry);

  if (allMachineTelemetry !== prevTelemetryRef.current) {
    lastSeenRef.current = Date.now();
    prevTelemetryRef.current = allMachineTelemetry;
  }

  // Re-evaluate signal level every second
  const [level, setLevel] = useState<SignalLevel>("disconnected");
  const [ageMs, setAgeMs] = useState<number | null>(null);

  useEffect(() => {
    const evaluate = () => {
      if (!connected) {
        setLevel("disconnected");
        setAgeMs(null);
        return;
      }
      const last = lastSeenRef.current;
      if (last === null) {
        setLevel("connected");
        setAgeMs(null);
        return;
      }
      const age = Date.now() - last;
      setAgeMs(age);
      if (age < LIVE_THRESHOLD_MS) setLevel("live");
      else if (age < SLOW_THRESHOLD_MS) setLevel("connected");
      else setLevel("slow");
    };

    evaluate();
    const id = setInterval(evaluate, 1000);
    return () => clearInterval(id);
  }, [connected]);

  const cfg = LEVEL_CONFIG[level];
  const Icon = cfg.icon;

  const activeCount = Object.values(allMachineTelemetry).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );

  const tooltipLines = [
    `Estado: ${cfg.label}`,
    `Dispositivos activos: ${activeCount}`,
    ageMs !== null ? `Último dato: hace ${formatAge(ageMs)}` : "Esperando primer dato…",
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-default select-none transition-status ${cfg.border} ${cfg.bg}`}
          >
            {/* Animated dot — pulses only when LIVE */}
            <span className="relative flex h-2 w-2 flex-shrink-0">
              {level === "live" && (
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-75`}
                />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 transition-status ${cfg.dot}`} />
            </span>

            <Icon className={`h-3.5 w-3.5 transition-colors duration-300 ${cfg.text}`} />

            <span className={`text-xs font-mono font-semibold tracking-wider transition-colors duration-300 ${cfg.text}`}>
              {cfg.label}
            </span>
          </div>
        </TooltipTrigger>

        <TooltipContent side="bottom" className="text-xs space-y-0.5">
          {tooltipLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
