/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useAhuHistory } from "@/hooks/useAhuHistory";
import { useAhuEvents } from "@/hooks/useAhuEvents";
import { useAhuHealth } from "@/hooks/useAhuHealth";
import type { AhuHealthStatus } from "@/domain/ahu/getAhuHealth";
import type { HvacEvent } from "@/types/event";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  ArrowLeft,
  Thermometer,
  Wind,
  Zap,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  WifiOff,
  TrendingUp,
  Factory,
  type LucideIcon,
} from "lucide-react";

import { AhuHistoryTemperatureChart } from "@/components/Graphs/AhuHistoryTemperatureCard";
import { AhuHistoryHumidityChart } from "@/components/Graphs/AhuHistoryHumidityChart";
import { useTranslation } from "@/i18n/useTranslation";

// Importar las nuevas MetricCards con SVG
import {
  TemperatureCard,
  HumidityCard,
  FanCard,
  AirflowCard,
  DamperCard,
  PowerCard,
  FilterCard,
  GenericCard,
} from "@/components/MetricCards";

export default function AhuDetailPage() {
  const navigate = useNavigate();
  const { telemetry } = useTelemetry();
  const { ahuId, plantId } = useParams();
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getHealth = useAhuHealth();

  const ahu = telemetry.find(
    (t) => t.stationId === ahuId && t.plantId === plantId,
  );

  const history = useAhuHistory(ahu);
  const events = useAhuEvents(ahu);
  const health = ahu ? getHealth(ahu) : undefined;

  if (!ahu || !health) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border-destructive/50">
          <CardContent className="p-12 text-center space-y-4">
            <WifiOff className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="text-lg font-semibold">{t.ahuDetail.ahuNotFound}</p>
            <p className="text-sm text-muted-foreground">
              {t.ahuDetail.unitNotExist}
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.ahuDetail.goBack}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(health.status);
  const hasActiveAlarms = health.status === "ALARM";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--muted))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted))_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)] opacity-20" />

      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] animate-pulse-slow" />

      <div className="relative z-10 p-6 md:p-8 space-y-6 max-w-450 mx-auto">
        {/* Header */}
        <section
          className={`
          space-y-4
          transition-all duration-1000 delay-100
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        `}
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          {/* Title & Status */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className={`
                  p-3 rounded-lg
                  ${statusConfig.bgColor} ${statusConfig.borderColor} border
                `}
                >
                  <Factory className={`w-6 h-6 ${statusConfig.iconColor}`} />
                </div>

                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                    {ahu.stationId}
                  </h1>
                  <p className="text-muted-foreground font-mono">
                    Plant {ahu.plantId}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Badge
                variant={statusConfig.badgeVariant}
                className={`text-base px-4 py-2 ${hasActiveAlarms ? "animate-pulse" : ""}`}
              >
                <statusConfig.StatusIcon className="w-4 h-4 mr-2" />
                {health.status}
              </Badge>

              {health.badPoints > 0 && (
                <p className="text-sm text-muted-foreground">
                  {health.badPoints} point{health.badPoints !== 1 ? "s" : ""}{" "}
                  out of range
                </p>
              )}
            </div>
          </div>

          {/* Status Summary Card */}
          <Card
            className={`
            border backdrop-blur-sm
            ${statusConfig.border} ${statusConfig.bg}
            ${hasActiveAlarms ? "shadow-lg shadow-destructive/20 animate-pulse" : ""}
          `}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <statusConfig.StatusIcon
                    className={`w-8 h-8 ${statusConfig.iconColor}`}
                  />
                  <div>
                    <p className="text-lg font-bold">{statusConfig.label}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Last update: {health.lastUpdate.toLocaleString()}
                    </p>
                  </div>
                </div>

                {events.length > 0 && (
                  <Badge variant="outline" className="font-mono">
                    {events.length} event{events.length !== 1 ? "s" : ""} logged
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview">
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="events" className="relative">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Events
              {events.length > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  variant="destructive"
                >
                  {events.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Environmental Conditions */}
            <Section
              title="Environmental Conditions"
              icon={Thermometer}
              mounted={mounted}
              delay={200}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <TemperatureCard
                  type="temperature"
                  label="Temperature"
                  value={ahu.points.temperature?.value || 0}
                  unit={ahu.points.temperature?.unit || "°C"}
                  quality={ahu.points.temperature?.quality}
                  color="primary"
                  min={0}
                  max={40}
                  target={22}
                />

                <HumidityCard
                  type="humidity"
                  label="Humidity"
                  value={ahu.points.humidity?.value || 0}
                  unit={ahu.points.humidity?.unit || "%"}
                  quality={ahu.points.humidity?.quality}
                  color="accent"
                />

                <Card className="border-border bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Temperature History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AhuHistoryTemperatureChart
                      data={history.temperature}
                      status={health.status}
                    />
                  </CardContent>
                </Card>
              </div>
            </Section>

            {/* Air Movement */}
            <Section
              title="Air Movement"
              icon={Wind}
              mounted={mounted}
              delay={300}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <FanCard
                  type="fan"
                  label="Fan Status"
                  value={ahu.points.fan_status?.value || "OFF"}
                  unit=""
                  quality={ahu.points.fan_status?.quality}
                  color="success"
                  status={String(ahu.points.fan_status?.value || "OFF")}
                />

                <AirflowCard
                  type="airflow"
                  label="Airflow"
                  value={ahu.points.airflow?.value || 0}
                  unit={ahu.points.airflow?.unit || "m³/h"}
                  quality={ahu.points.airflow?.quality}
                  color="chart"
                  min={0}
                  max={1000}
                />

                <DamperCard
                  type="damper"
                  label="Damper Position"
                  value={ahu.points.damper_position?.value || 0}
                  unit={ahu.points.damper_position?.unit || "%"}
                  quality={ahu.points.damper_position?.quality}
                  color="accent"
                />
              </div>
            </Section>

            {/* Energy & Filtration */}
            <Section
              title="Energy & Filtration"
              icon={Zap}
              mounted={mounted}
              delay={400}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <PowerCard
                  type="power"
                  label="Power Status"
                  value={ahu.points.power_status?.value || "OFF"}
                  unit=""
                  quality={ahu.points.power_status?.quality}
                  color="warning"
                  status={String(ahu.points.power_status?.value || "OFF")}
                />

                <FilterCard
                  type="filter"
                  label="Filter ΔP"
                  value={ahu.points.filter_dp?.value || 0}
                  unit={ahu.points.filter_dp?.unit || "Pa"}
                  quality={ahu.points.filter_dp?.quality}
                  color="destructive"
                  min={0}
                  max={500}
                  critical={400}
                />

                <Card className="border-border bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Temperature History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AhuHistoryHumidityChart
                      data={history.humidity}
                      status={health.status}
                    />
                  </CardContent>
                </Card>
              </div>
            </Section>

            {/* Additional Points */}
            {Object.keys(ahu.points).filter(
              (key) =>
                ![
                  "temperature",
                  "humidity",
                  "fan_status",
                  "airflow",
                  "damper_position",
                  "power_status",
                  "filter_dp",
                  "status",
                ].includes(key),
            ).length > 0 && (
              <Section
                title="Additional Data"
                icon={Activity}
                mounted={mounted}
                delay={500}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Object.entries(ahu.points)
                    .filter(
                      ([key]) =>
                        ![
                          "temperature",
                          "humidity",
                          "fan_status",
                          "airflow",
                          "damper_position",
                          "power_status",
                          "filter_dp",
                          "status",
                        ].includes(key),
                    )
                    .map(([key, point]) => (
                      <GenericCard
                        key={key}
                        type="generic"
                        label={formatLabel(key)}
                        value={point.value}
                        unit={point.unit || ""}
                        quality={point.quality}
                        color="chart"
                      />
                    ))}
                </div>
              </Section>
            )}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <EventsTimeline events={events} status={health.status} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

interface SectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  mounted: boolean;
  delay: number;
}

function Section({
  title,
  icon: Icon,
  children,
  mounted,
  delay,
}: SectionProps) {
  return (
    <section
      className={`
      space-y-4
      transition-all duration-1000
      ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
    `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      </div>

      {children}
    </section>
  );
}

interface EventsTimelineProps {
  events: HvacEvent[];
  status: AhuHealthStatus;
}

function EventsTimeline({ events }: EventsTimelineProps) {
  if (events.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
          <p className="text-lg font-semibold">No Events Logged</p>
          <p className="text-sm text-muted-foreground">
            This unit has no recent events or alarms
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
          Event Timeline
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {events.map((event, idx) => (
          <div
            key={idx}
            className="flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/30"
          >
            <EventIcon type={event.type} />

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="font-medium">{event.message}</p>

                <Badge variant={getEventVariant(event.type)}>
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
  const config = {
    ALARM: { Icon: XCircle, color: "text-destructive" },
    WARNING: { Icon: AlertTriangle, color: "text-yellow-500" },
    default: { Icon: CheckCircle2, color: "text-green-500" },
  };

  const { Icon, color } = config[type as keyof typeof config] || config.default;

  return <Icon className={`w-5 h-5 ${color} mt-0.5`} />;
}

function getEventVariant(
  type: string,
): "destructive" | "secondary" | "default" {
  if (type === "ALARM") return "destructive";
  if (type === "WARNING") return "secondary";
  return "default";
}

/* ================= HELPERS ================= */

function getStatusConfig(status: AhuHealthStatus) {
  const configs = {
    ALARM: {
      label: "Critical Alarm Active",
      StatusIcon: XCircle,
      iconColor: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/30",
      border: "border-destructive/50",
      bg: "bg-destructive/5",
      badgeVariant: "destructive" as const,
    },
    WARNING: {
      label: "Warnings Detected",
      StatusIcon: AlertTriangle,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      border: "border-yellow-500/50",
      bg: "bg-yellow-500/5",
      badgeVariant: "secondary" as const,
    },
    OK: {
      label: "Normal Operation",
      StatusIcon: CheckCircle2,
      iconColor: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      border: "border-green-500/50",
      bg: "bg-green-500/5",
      badgeVariant: "default" as const,
    },
    DISCONNECTED: {
      label: "No Communication",
      StatusIcon: WifiOff,
      iconColor: "text-muted-foreground",
      bgColor: "bg-muted/10",
      borderColor: "border-muted/30",
      border: "border-muted",
      bg: "bg-muted/5",
      badgeVariant: "outline" as const,
    },
  };

  return configs[status];
}

function formatLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
