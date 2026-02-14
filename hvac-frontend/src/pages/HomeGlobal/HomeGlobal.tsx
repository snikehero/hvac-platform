/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AirVent, Activity, Server, AlertTriangle } from "lucide-react";

import { routes } from "@/router/routes";
import { useTelemetry } from "@/hooks/useTelemetry";
import { getAhuHealth } from "@/domain/ahu/getAhuHealth";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function HomeGlobal() {
  const navigate = useNavigate();
  const { telemetry } = useTelemetry();

  const metrics = useMemo(() => {
    const totalDevices = telemetry.length;

    const activeAlarms = telemetry.reduce((acc, ahu) => {
      const health = getAhuHealth(ahu);
      return acc + (health.status === "ALARM" ? 1 : 0);
    }, 0);

    const plants = new Set(telemetry.map((t) => t.plantId)).size;

    return {
      totalDevices,
      activeAlarms,
      plants,
    };
  }, [telemetry]);

  return (
    <div className="min-h-screen bg-background text-foreground p-10 space-y-16">
      {/* ================= HERO ================= */}
      <section className="max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            FireIIOT Platform
          </h1>
          <p className="text-muted-foreground text-lg">
            Intelligent industrial monitoring platform providing centralized
            telemetry, real-time insights, and modular scalability across
            multiple operational domains.
          </p>
        </div>

        <div className="flex gap-4">
          <Button onClick={() => navigate(routes.hvac.home)}>
            Enter HVAC Module
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(routes.hvac.dashboard)}
          >
            View Active Systems
          </Button>
        </div>
      </section>

      {/* ================= GLOBAL METRICS ================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          icon={Server}
          label="Connected Devices"
          value={metrics.totalDevices}
        />

        <MetricCard
          icon={Activity}
          label="Active Plants"
          value={metrics.plants}
        />

        <MetricCard
          icon={AlertTriangle}
          label="Active Alarms"
          value={metrics.activeAlarms}
          alert={metrics.activeAlarms > 0}
        />
      </section>

      {/* ================= MODULES ================= */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight">Modules</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ModuleCard
            icon={AirVent}
            title="HVAC"
            description="Real-time air handling unit monitoring and diagnostics."
            status="ACTIVE"
            onClick={() => navigate(routes.hvac.home)}
          />

          <ModuleCard
            title="Categoria2"
            description="Reserved for future industrial expansion modules."
            status="COMING SOON"
          />

          <ModuleCard
            title="Categoria3"
            description="Reserved for additional operational domains."
            status="COMING SOON"
          />
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <section className="pt-10">
        <Separator className="mb-6" />
        <div className="text-sm text-muted-foreground space-y-1">
          <div>FireIIOT Platform v1.0</div>
          <div>Industrial Monitoring & Telemetry System</div>
          <div>© 2026 FireIIOT</div>
        </div>
      </section>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function MetricCard({
  icon: Icon,
  label,
  value,
  alert,
}: {
  icon: any;
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <Card className={alert ? "border-red-500/40" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function ModuleCard({
  icon: Icon,
  title,
  description,
  status,
  onClick,
}: {
  icon?: any;
  title: string;
  description: string;
  status: "ACTIVE" | "COMING SOON";
  onClick?: () => void;
}) {
  return (
    <Card
      onClick={status === "ACTIVE" ? onClick : undefined}
      className={`transition ${
        status === "ACTIVE" ? "cursor-pointer hover:shadow-md" : "opacity-60"
      }`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5" />}
            {title}
          </CardTitle>
          <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
            {status}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
