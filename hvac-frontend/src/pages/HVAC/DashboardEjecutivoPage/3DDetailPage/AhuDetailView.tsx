/* eslint-disable react-hooks/rules-of-hooks */
import { getAhuHealth } from "@/domain/ahu/getAhuHealth";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useAhuHistory } from "@/hooks/useAhuHistory";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

import Scene from "./presentation/AhuDetail3D/Scene/Scene";
import FanModel from "./presentation/AhuDetail3D/Model/FanModel";
import { audioManager } from "./presentation/Audio/AudioManager";
import { AhuHistoryTemperatureChart } from "@/components/Graphs/AhuHistoryTemperatureCard";
import { AhuHistoryHumidityChart } from "@/components/Graphs/AhuHistoryHumidityChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Thermometer,
  Droplets,
  Fan,
  Activity,
  AlertTriangle,
  CheckCircle2,
  WifiOff,
  Clock,
  Gauge,
} from "lucide-react";

const STATUS_CONFIG = {
  OK: {
    label: "Operativo",
    color: "bg-green-500",
    border: "border-green-500/30",
    bg: "bg-green-500/5",
    glow: "",
    textColor: "text-green-500",
    icon: CheckCircle2,
    pulse: false,
  },
  WARNING: {
    label: "Advertencia",
    color: "bg-yellow-500",
    border: "border-yellow-500/50",
    bg: "bg-yellow-500/5",
    glow: "shadow-md shadow-yellow-500/10",
    textColor: "text-yellow-500",
    icon: AlertTriangle,
    pulse: false,
  },
  ALARM: {
    label: "Alarma",
    color: "bg-red-500",
    border: "border-destructive/50",
    bg: "bg-destructive/5",
    glow: "shadow-lg shadow-destructive/20",
    textColor: "text-destructive",
    icon: AlertTriangle,
    pulse: true,
  },
  DISCONNECTED: {
    label: "Desconectado",
    color: "bg-gray-500",
    border: "border-muted",
    bg: "bg-muted/5",
    glow: "",
    textColor: "text-muted-foreground",
    icon: WifiOff,
    pulse: false,
  },
};

export default function AhuDetailView() {
  const { plantId, ahuId } = useParams<{
    plantId: string;
    ahuId: string;
  }>();

  const navigate = useNavigate();
  const { telemetry } = useTelemetry();

  const ahu = telemetry.find(
    (a) => a.plantId === plantId && a.stationId === ahuId,
  );

  if (!ahu) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="p-8 text-center space-y-4">
          <WifiOff className="w-12 h-12 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-bold">AHU no encontrado</h2>
          <p className="text-muted-foreground">
            El equipo {ahuId} en planta {plantId} no está disponible.
          </p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Card>
      </div>
    );
  }

  const health = getAhuHealth(ahu);
  const history = useAhuHistory(ahu);
  const config = STATUS_CONFIG[health.status];
  const StatusIcon = config.icon;

  /* --- Extract telemetry values --- */
  const fanStatusRaw = ahu.points.fan_status?.value;
  const temperatureRaw = ahu.points.temperature?.value;
  const humidityRaw = ahu.points.humidity?.value;

  const fanStatus =
    fanStatusRaw === true || fanStatusRaw === 1 || fanStatusRaw === "ON";
  const temperature = typeof temperatureRaw === "number" ? temperatureRaw : 0;
  const humidity = typeof humidityRaw === "number" ? humidityRaw : 0;

  const timeSinceUpdate = Math.round(
    (Date.now() - new Date(ahu.timestamp).getTime()) / 1000,
  );
  const timeLabel =
    timeSinceUpdate < 60
      ? `${timeSinceUpdate}s`
      : `${Math.floor(timeSinceUpdate / 60)}m`;

  /* --- Audio on alarm transition --- */
  const prevAlarmRef = useRef(false);

  useEffect(() => {
    audioManager.loadGlobal("ahu-alarm", "/models/fan/sound/fan-alarm.mp3");
  }, []);

  useEffect(() => {
    const isAlarm = health.status === "ALARM";
    if (!prevAlarmRef.current && isAlarm) {
      audioManager.playOneShot("ahu-alarm");
    }
    prevAlarmRef.current = isAlarm;
  }, [health.status]);

  /* --- Sensor list (excluding known keys) --- */
  const knownKeys = new Set([
    "fan_status",
    "temperature",
    "humidity",
    "status",
  ]);
  const extraSensors = Object.entries(ahu.points).filter(
    ([key]) => !knownKeys.has(key),
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* ===== HEADER ===== */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              {ahu.stationId}
            </h1>
            <Badge
              className={`${config.color} text-white font-mono ${config.pulse ? "animate-pulse" : ""}`}
            >
              <StatusIcon className="w-3 h-3 mr-1.5" />
              {config.label}
            </Badge>
            {health.badPoints > 0 && (
              <Badge variant="destructive" className="font-mono">
                {health.badPoints} BAD
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            Planta {ahu.plantId}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>hace {timeLabel}</span>
        </div>
      </div>

      {/* ===== QUICK STATS ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStat
          icon={<Activity className={`w-5 h-5 ${config.textColor}`} />}
          label="Estado"
          value={config.label}
          accent={config.textColor}
          border={config.border}
          bg={config.bg}
        />
        <QuickStat
          icon={<Thermometer className="w-5 h-5 text-orange-500" />}
          label="Temperatura"
          value={`${temperature.toFixed(1)}°C`}
          accent="text-orange-500"
          border="border-orange-500/20"
          bg="bg-orange-500/5"
        />
        <QuickStat
          icon={<Droplets className="w-5 h-5 text-cyan-500" />}
          label="Humedad"
          value={`${humidity.toFixed(1)}%`}
          accent="text-cyan-500"
          border="border-cyan-500/20"
          bg="bg-cyan-500/5"
        />
        <QuickStat
          icon={
            <Fan
              className={`w-5 h-5 ${fanStatus ? "text-green-500" : "text-muted-foreground"}`}
            />
          }
          label="Ventilador"
          value={fanStatus ? "Encendido" : "Apagado"}
          accent={fanStatus ? "text-green-500" : "text-muted-foreground"}
          border={
            fanStatus ? "border-green-500/20" : "border-muted"
          }
          bg={fanStatus ? "bg-green-500/5" : "bg-muted/5"}
        />
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 3D Viewer */}
        <Card
          className={`
            xl:col-span-2 overflow-hidden backdrop-blur-sm
            ${config.border} ${config.bg} ${config.glow}
          `}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gauge className="w-5 h-5 text-primary" />
                Visualización 3D
              </CardTitle>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${config.color} ${config.pulse ? "animate-ping" : ""}`}
                />
                <span className="text-xs text-muted-foreground">
                  {fanStatus ? "Fan activo" : "Fan inactivo"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] lg:h-[480px] p-2 pt-0">
            <Scene status={health.status}>
              <FanModel
                fanStatus={fanStatus}
                temperature={temperature}
                status={health.status}
              />
            </Scene>
          </CardContent>
        </Card>

        {/* Technical Info Panel */}
        <Card className="backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-primary" />
              Información Técnica
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Primary readings */}
            <div className="space-y-3">
              <SensorRow
                label="Estado operativo"
                value={health.status}
                icon={<StatusIcon className={`w-4 h-4 ${config.textColor}`} />}
                valueClass={config.textColor}
              />
              <SensorRow
                label="Temperatura"
                value={`${temperature.toFixed(1)} °C`}
                icon={
                  <Thermometer className="w-4 h-4 text-orange-500" />
                }
              />
              <SensorRow
                label="Humedad"
                value={`${humidity.toFixed(1)} %`}
                icon={<Droplets className="w-4 h-4 text-cyan-500" />}
              />
              <SensorRow
                label="Ventilador"
                value={fanStatus ? "ON" : "OFF"}
                icon={<Fan className="w-4 h-4 text-primary" />}
                valueClass={fanStatus ? "text-green-500" : "text-muted-foreground"}
              />
              {health.badPoints > 0 && (
                <SensorRow
                  label="Puntos BAD"
                  value={String(health.badPoints)}
                  icon={
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  }
                  valueClass="text-destructive"
                />
              )}
            </div>

            {/* Extra sensors */}
            {extraSensors.length > 0 && (
              <>
                <div className="border-t border-border/50 pt-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Sensores adicionales
                  </h4>
                  <div className="space-y-2">
                    {extraSensors.map(([key, point]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm text-muted-foreground capitalize">
                          {key.replaceAll("_", " ")}
                        </span>
                        <span className="text-sm font-medium font-mono">
                          {point?.value ?? "-"}
                          {point?.unit ? ` ${point.unit}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== CHARTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AhuHistoryTemperatureChart
          data={history.temperature}
          status={health.status}
        />
        <AhuHistoryHumidityChart
          data={history.humidity}
          status={health.status}
        />
      </div>
    </div>
  );
}

/* ===== Subcomponents ===== */

interface QuickStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  border: string;
  bg: string;
}

function QuickStat({ icon, label, value, accent, border, bg }: QuickStatProps) {
  return (
    <Card
      className={`
        relative overflow-hidden backdrop-blur-sm
        transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
        ${border} ${bg}
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-background/50">{icon}</div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className={`text-lg font-bold tabular-nums truncate ${accent}`}>
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SensorRowProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  valueClass?: string;
}

function SensorRow({ label, value, icon, valueClass = "" }: SensorRowProps) {
  return (
    <div className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className={`text-sm font-semibold font-mono ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}
