/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Server,
  AlertTriangle,
  TrendingUp,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useAhuHealth } from "@/hooks/useAhuHealth";
import { useClock } from "@/domain/hooks/useClock";

export function HeroSystemStatus() {
  const { telemetry } = useTelemetry();
  const getHealth = useAhuHealth();
  const now = useClock(1000); // Force re-render every second to recalculate health states

  const stats = useMemo(() => {
    let alarms = 0;
    let warnings = 0;
    let disconnected = 0;
    let ok = 0;

    telemetry.forEach((ahu) => {
      const health = getHealth(ahu);

      switch (health.status) {
        case "ALARM":
          alarms++;
          break;
        case "WARNING":
          warnings++;
          break;
        case "DISCONNECTED":
          disconnected++;
          break;
        case "OK":
          ok++;
          break;
      }
    });

    const total = telemetry.length;
    const affected = alarms + warnings;
    const operational = ok;
    const operationalPercentage =
      total > 0 ? Math.round((operational / total) * 100) : 0;

    // Determinar estado del sistema
    let systemStatus: "OPTIMAL" | "DEGRADED" | "CRITICAL" | "NO_DATA" =
      "NO_DATA";

    if (total === 0) {
      systemStatus = "NO_DATA";
    } else if (alarms > 0) {
      systemStatus = "CRITICAL";
    } else if (warnings > 0 || disconnected > 0) {
      systemStatus = "DEGRADED";
    } else {
      systemStatus = "OPTIMAL";
    }

    return {
      total,
      alarms,
      warnings,
      disconnected,
      ok,
      affected,
      operational,
      operationalPercentage,
      systemStatus,
    };
  }, [telemetry, getHealth, now]);

  // Configuración por estado del sistema
  const statusConfig = {
    OPTIMAL: {
      icon: ShieldCheck,
      title: "System Optimal",
      subtitle: "All units operating normally",
      gradient: "from-green-600 via-green-500 to-green-400",
      iconColor: "text-green-100",
      pulse: false,
    },
    DEGRADED: {
      icon: ShieldAlert,
      title: "System Degraded",
      subtitle: "Some units require attention",
      gradient: "from-yellow-600 via-yellow-500 to-orange-400",
      iconColor: "text-yellow-100",
      pulse: false,
    },
    CRITICAL: {
      icon: ShieldX,
      title: "System Critical",
      subtitle: "Immediate action required",
      gradient: "from-red-600 via-red-500 to-orange-500",
      iconColor: "text-red-100",
      pulse: true,
    },
    NO_DATA: {
      icon: Server,
      title: "No Data",
      subtitle: "Waiting for telemetry",
      gradient: "from-gray-600 via-gray-500 to-gray-400",
      iconColor: "text-gray-100",
      pulse: false,
    },
  };

  const config = statusConfig[stats.systemStatus];
  const Icon = config.icon;

  const percent = (value: number) =>
    stats.total > 0 ? (value / stats.total) * 100 : 0;

  return (
    <Card
      className={`
        relative overflow-hidden border-0
        bg-linear-to-r ${config.gradient}
        shadow-2xl
        ${config.pulse ? "animate-pulse" : ""}
      `}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-size-[20px_20px]" />
      </div>

      {/* Glow Effect */}
      {config.pulse && (
        <div className="absolute inset-0 bg-white/10 animate-pulse" />
      )}

      <div className="relative z-10 p-8 md:p-10">
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Left: Icon & Status */}
          <div className="flex items-center gap-6">
            {/* Animated Icon */}
            <div className="relative">
              <div
                className={`
                absolute inset-0 rounded-full bg-white/20 blur-xl
                ${config.pulse ? "animate-ping" : ""}
              `}
              />
              <div className="relative p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <Icon className={`w-12 h-12 ${config.iconColor}`} />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="text-white">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                {config.title}
              </h2>
              <p className="text-lg md:text-xl opacity-90 font-medium">
                {config.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Stats Grid */}
          {stats.systemStatus !== "NO_DATA" && (
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
              <StatBox
                icon={Activity}
                label="Total Units"
                value={stats.total}
              />
              <StatBox
                icon={AlertTriangle}
                label="Alarms"
                value={stats.alarms}
                highlight={stats.alarms > 0}
              />
              <StatBox
                icon={ShieldAlert}
                label="Warnings"
                value={stats.warnings}
                highlight={stats.warnings > 0}
              />
              <StatBox
                icon={TrendingUp}
                label="Operational"
                value={`${stats.operationalPercentage}%`}
              />
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {stats.total > 0 && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs text-white/80 font-medium">
              <span>System Health Distribution</span>
              <span>
                {stats.operational} / {stats.total} OK
              </span>
            </div>

            <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden flex backdrop-blur-sm">
              {/* Alarms */}
              {stats.alarms > 0 && (
                <div
                  className="bg-red-600 transition-all duration-1000 flex items-center justify-center"
                  style={{ width: `${percent(stats.alarms)}%` }}
                >
                  {percent(stats.alarms) > 10 && (
                    <span className="text-xs font-bold text-white">
                      {stats.alarms}
                    </span>
                  )}
                </div>
              )}

              {/* Warnings */}
              {stats.warnings > 0 && (
                <div
                  className="bg-yellow-400 transition-all duration-1000 flex items-center justify-center"
                  style={{ width: `${percent(stats.warnings)}%` }}
                >
                  {percent(stats.warnings) > 10 && (
                    <span className="text-xs font-bold text-gray-900">
                      {stats.warnings}
                    </span>
                  )}
                </div>
              )}

              {/* Disconnected */}
              {stats.disconnected > 0 && (
                <div
                  className="bg-orange-500 transition-all duration-1000 flex items-center justify-center"
                  style={{ width: `${percent(stats.disconnected)}%` }}
                >
                  {percent(stats.disconnected) > 10 && (
                    <span className="text-xs font-bold text-white">
                      {stats.disconnected}
                    </span>
                  )}
                </div>
              )}

              {/* OK */}
              {stats.ok > 0 && (
                <div
                  className="bg-green-500 transition-all duration-1000 flex items-center justify-center"
                  style={{ width: `${percent(stats.ok)}%` }}
                >
                  {percent(stats.ok) > 10 && (
                    <span className="text-xs font-bold text-white">
                      {stats.ok}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ===== Subcomponents =====

interface StatBoxProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  highlight?: boolean;
}

function StatBox({ icon: Icon, label, value, highlight }: StatBoxProps) {
  return (
    <div
      className={`
        p-4 rounded-lg backdrop-blur-sm border
        ${
          highlight
            ? "bg-white/20 border-white/30 shadow-lg"
            : "bg-white/10 border-white/20"
        }
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 opacity-80" />
        <div className="text-xs uppercase tracking-wide opacity-80 font-medium">
          {label}
        </div>
      </div>
      <div
        className={`text-3xl font-black tabular-nums ${highlight ? "animate-pulse" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
