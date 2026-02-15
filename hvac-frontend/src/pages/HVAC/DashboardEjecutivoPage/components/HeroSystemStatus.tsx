/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from "react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { getAhuHealth } from "@/domain/ahu/getAhuHealth";
import { Card } from "@/components/ui/card";
import { AlertTriangle, WifiOff, CheckCircle2, Activity } from "lucide-react";
import { useClock } from "@/domain/hooks/useClock";
type GlobalStatus = "OK" | "WARNING" | "ALARM" | "DISCONNECTED" | "NO_DATA";

export function HeroSystemStatus() {
  const { telemetry } = useTelemetry();
  const now = useClock();
  const { status, subtitle, alarms, warnings, disconnected, okCount, total } =
    useMemo(() => {
      if (telemetry.length === 0) {
        return {
          status: "NO_DATA" as GlobalStatus,
          subtitle: "Sin datos recibidos",
          alarms: 0,
          warnings: 0,
          disconnected: 0,
          okCount: 0,
          total: 0,
        };
      }

      let alarms = 0;
      let warnings = 0;
      let disconnected = 0;
      let okCount = 0;

      telemetry.forEach((ahu) => {
        const health = getAhuHealth(ahu);

        if (health.status === "ALARM") alarms++;
        else if (health.status === "WARNING") warnings++;
        else if (health.status === "DISCONNECTED") disconnected++;
        else okCount++;
      });

      let status: GlobalStatus = "OK";
      let subtitle = "Operación estable";

      if (alarms > 0) {
        status = "ALARM";
        subtitle = "Intervención inmediata requerida";
      } else if (disconnected > 0) {
        status = "DISCONNECTED";
        subtitle = "Pérdida parcial de comunicación";
      } else if (warnings > 0) {
        status = "WARNING";
        subtitle = "Condiciones fuera de rango";
      }

      return {
        status,
        subtitle,
        alarms,
        warnings,
        disconnected,
        okCount,
        total: telemetry.length,
      };
    }, [telemetry, now]);

  const config = {
    ALARM: {
      gradient: "from-red-700 to-red-500",
      text: "SISTEMA CRÍTICO",
      icon: AlertTriangle,
    },
    DISCONNECTED: {
      gradient: "from-orange-600 to-orange-400",
      text: "SISTEMA DEGRADADO",
      icon: WifiOff,
    },
    WARNING: {
      gradient: "from-yellow-600 to-yellow-400",
      text: "SISTEMA EN ADVERTENCIA",
      icon: AlertTriangle,
    },
    OK: {
      gradient: "from-green-700 to-green-500",
      text: "SISTEMA SALUDABLE",
      icon: CheckCircle2,
    },
    NO_DATA: {
      gradient: "from-neutral-700 to-neutral-600",
      text: "SIN DATOS",
      icon: Activity,
    },
  }[status];

  const Icon = config.icon;

  /* ---------- proporciones ---------- */

  const percent = (value: number) => (total > 0 ? (value / total) * 100 : 0);

  return (
    <Card
      className={`w-full p-10 text-white shadow-2xl bg-linear-to-r ${config.gradient} transition-all duration-500`}
    >
      <div className="flex flex-col gap-8">
        {/* --------- Header --------- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Icon className="h-14 w-14" />
              {status !== "OK" && status !== "NO_DATA" && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white animate-ping" />
              )}
            </div>

            <div>
              <h2 className="text-4xl font-bold tracking-wide">
                {config.text}
              </h2>

              <p className="text-lg opacity-90">{subtitle}</p>
            </div>
          </div>

          {/* Métricas */}
          {status !== "NO_DATA" && (
            <div className="flex gap-8 text-center">
              <Metric value={alarms} label="Alarmas" />
              <Metric value={warnings} label="Warnings" />
              <Metric value={disconnected} label="Sin comunicación" />
            </div>
          )}
        </div>

        {/* --------- Barra proporcional --------- */}

        {total > 0 && (
          <div className="w-full h-4 bg-black/20 rounded-full overflow-hidden flex">
            <div
              className="bg-red-500 transition-all duration-700"
              style={{ width: `${percent(alarms)}%` }}
            />
            <div
              className="bg-yellow-400 transition-all duration-700"
              style={{ width: `${percent(warnings)}%` }}
            />
            <div
              className="bg-orange-400 transition-all duration-700"
              style={{ width: `${percent(disconnected)}%` }}
            />
            <div
              className="bg-green-500 transition-all duration-700"
              style={{ width: `${percent(okCount)}%` }}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

/* ---------- Subcomponente métrica ---------- */

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wide opacity-80">{label}</div>
    </div>
  );
}
