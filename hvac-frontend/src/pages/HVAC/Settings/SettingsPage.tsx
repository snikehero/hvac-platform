import { useState } from "react";
import {
  useSettings,
  DEFAULT_SETTINGS,
  type HvacThresholds,
  type HvacNotifications,
  type HvacGeneral,
} from "@/context/SettingsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Thermometer,
  Droplets,
  WifiOff,
  Bell,
  Volume2,
  VolumeX,
  Globe,
  RefreshCw,
  RotateCcw,
  Save,
  AlertTriangle,
  Gauge,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { audioManager } from "@/pages/HVAC/DashboardEjecutivoPage/3DDetailPage/presentation/Audio/AudioManager";

export default function SettingsPage() {
  const {
    settings,
    updateThresholds,
    updateNotifications,
    updateGeneral,
    resetToDefaults,
  } = useSettings();

  // Local draft state so we can show "unsaved" and batch saves
  const [thresholds, setThresholds] = useState<HvacThresholds>(
    settings.thresholds,
  );
  const [notifications, setNotifications] = useState<HvacNotifications>(
    settings.notifications,
  );
  const [general, setGeneral] = useState<HvacGeneral>(settings.general);

  const hasChanges =
    JSON.stringify(thresholds) !== JSON.stringify(settings.thresholds) ||
    JSON.stringify(notifications) !== JSON.stringify(settings.notifications) ||
    JSON.stringify(general) !== JSON.stringify(settings.general);

  function handleSave() {
    updateThresholds(thresholds);
    updateNotifications(notifications);
    updateGeneral(general);
    toast.success("Configuración guardada correctamente");
  }

  function handleReset() {
    setThresholds(DEFAULT_SETTINGS.thresholds);
    setNotifications(DEFAULT_SETTINGS.notifications);
    setGeneral(DEFAULT_SETTINGS.general);
    resetToDefaults();
    toast.info("Configuración restablecida a valores por defecto");
  }

  function handleTestSound() {
    audioManager.loadGlobal(
      "test-alarm",
      "/models/fan/sound/fan-alarm.mp3",
    );
    setTimeout(() => {
      audioManager.playOneShot("test-alarm");
    }, 300);
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* ===== HEADER ===== */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Configuración
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Administra los umbrales de alarma, notificaciones y preferencias
              generales de la plataforma HVAC.
            </p>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <Tabs defaultValue="thresholds" className="space-y-6">
        <TabsList>
          <TabsTrigger value="thresholds" className="gap-1.5">
            <Gauge className="w-4 h-4" />
            Umbrales
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="w-4 h-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-1.5">
            <Globe className="w-4 h-4" />
            General
          </TabsTrigger>
        </TabsList>

        {/* ===========================
            TAB 1 - UMBRALES
           =========================== */}
        <TabsContent value="thresholds" className="space-y-6">
          {/* Temperatura */}
          <Card className="backdrop-blur-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Thermometer className="w-5 h-5 text-orange-500" />
                Umbrales de Temperatura
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Define los límites que disparan advertencias y alarmas por
                temperatura.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ThresholdInput
                  label="Advertencia (WARNING)"
                  description="Se activa cuando la temperatura supera este valor"
                  value={thresholds.temperatureWarning}
                  unit="°C"
                  badgeColor="bg-yellow-500"
                  onChange={(v) =>
                    setThresholds((p) => ({ ...p, temperatureWarning: v }))
                  }
                />
                <ThresholdInput
                  label="Alarma (ALARM)"
                  description="Se activa cuando la temperatura supera este valor"
                  value={thresholds.temperatureAlarm}
                  unit="°C"
                  badgeColor="bg-red-500"
                  onChange={(v) =>
                    setThresholds((p) => ({ ...p, temperatureAlarm: v }))
                  }
                />
              </div>

              {thresholds.temperatureWarning >= thresholds.temperatureAlarm && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md p-3">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  El umbral de advertencia debe ser menor al de alarma.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Humedad */}
          <Card className="backdrop-blur-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Droplets className="w-5 h-5 text-cyan-500" />
                Umbrales de Humedad
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Define los límites que disparan advertencias y alarmas por
                humedad relativa.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ThresholdInput
                  label="Advertencia (WARNING)"
                  description="Se activa cuando la humedad supera este valor"
                  value={thresholds.humidityWarning}
                  unit="%"
                  badgeColor="bg-yellow-500"
                  onChange={(v) =>
                    setThresholds((p) => ({ ...p, humidityWarning: v }))
                  }
                />
                <ThresholdInput
                  label="Alarma (ALARM)"
                  description="Se activa cuando la humedad supera este valor"
                  value={thresholds.humidityAlarm}
                  unit="%"
                  badgeColor="bg-red-500"
                  onChange={(v) =>
                    setThresholds((p) => ({ ...p, humidityAlarm: v }))
                  }
                />
              </div>

              {thresholds.humidityWarning >= thresholds.humidityAlarm && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md p-3">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  El umbral de advertencia debe ser menor al de alarma.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Desconexión */}
          <Card className="backdrop-blur-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <WifiOff className="w-5 h-5 text-muted-foreground" />
                Tiempo de Desconexión
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Tiempo sin recibir datos antes de marcar un AHU como
                desconectado.
              </p>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm space-y-2">
                <Label htmlFor="disconnect-timeout">Timeout (segundos)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="disconnect-timeout"
                    type="number"
                    min={10}
                    max={600}
                    value={thresholds.disconnectTimeoutSeconds}
                    onChange={(e) =>
                      setThresholds((p) => ({
                        ...p,
                        disconnectTimeoutSeconds: Number(e.target.value) || 120,
                      }))
                    }
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">
                    {thresholds.disconnectTimeoutSeconds >= 60
                      ? `${(thresholds.disconnectTimeoutSeconds / 60).toFixed(1)} min`
                      : `${thresholds.disconnectTimeoutSeconds}s`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor actual:{" "}
                  <span className="font-mono">
                    {settings.thresholds.disconnectTimeoutSeconds}s
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===========================
            TAB 2 - NOTIFICACIONES
           =========================== */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="backdrop-blur-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5 text-primary" />
                Sonido de Alarma
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configura las alertas sonoras cuando un AHU entra en estado de
                alarma.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sonido habilitado</Label>
                  <p className="text-sm text-muted-foreground">
                    Reproduce un sonido al detectar una nueva alarma.
                  </p>
                </div>
                <Switch
                  checked={notifications.soundEnabled}
                  onCheckedChange={(checked) =>
                    setNotifications((p) => ({ ...p, soundEnabled: checked }))
                  }
                />
              </div>

              <Separator />

              {/* Volume */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Volumen</Label>
                  <div className="flex items-center gap-2">
                    {notifications.soundVolume === 0 ? (
                      <VolumeX className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-primary" />
                    )}
                    <span className="text-sm font-mono w-10 text-right">
                      {Math.round(notifications.soundVolume * 100)}%
                    </span>
                  </div>
                </div>
                <Slider
                  value={[notifications.soundVolume * 100]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={([v]) =>
                    setNotifications((p) => ({
                      ...p,
                      soundVolume: v / 100,
                    }))
                  }
                  disabled={!notifications.soundEnabled}
                />
              </div>

              <Separator />

              {/* Test */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Probar sonido</Label>
                  <p className="text-sm text-muted-foreground">
                    Reproduce el sonido de alarma con el volumen configurado.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestSound}
                  disabled={!notifications.soundEnabled}
                >
                  <Play className="w-4 h-4 mr-1.5" />
                  Reproducir
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===========================
            TAB 3 - GENERAL
           =========================== */}
        <TabsContent value="general" className="space-y-6">
          <Card className="backdrop-blur-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="w-5 h-5 text-primary" />
                Preferencias Generales
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Ajustes de idioma y comportamiento general de la plataforma.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Idioma</Label>
                  <p className="text-sm text-muted-foreground">
                    Idioma preferido para la interfaz.
                  </p>
                </div>
                <Select
                  value={general.language}
                  onValueChange={(v) =>
                    setGeneral((p) => ({
                      ...p,
                      language: v as "es" | "en",
                    }))
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Refresh interval */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Intervalo de refresco</Label>
                    <p className="text-sm text-muted-foreground">
                      Frecuencia de actualización de datos en el dashboard.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-mono">
                      {general.refreshIntervalSeconds}s
                    </span>
                  </div>
                </div>
                <Slider
                  value={[general.refreshIntervalSeconds]}
                  min={1}
                  max={30}
                  step={1}
                  onValueChange={([v]) =>
                    setGeneral((p) => ({
                      ...p,
                      refreshIntervalSeconds: v,
                    }))
                  }
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1s (tiempo real)</span>
                  <span>30s (bajo consumo)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===== FOOTER ACTIONS ===== */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={handleReset} className="gap-1.5">
          <RotateCcw className="w-4 h-4" />
          Restablecer valores por defecto
        </Button>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="secondary" className="font-mono text-xs">
              Cambios sin guardar
            </Badge>
          )}
          <Button onClick={handleSave} disabled={!hasChanges} className="gap-1.5">
            <Save className="w-4 h-4" />
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ===== Subcomponents ===== */

interface ThresholdInputProps {
  label: string;
  description: string;
  value: number;
  unit: string;
  badgeColor: string;
  onChange: (value: number) => void;
}

function ThresholdInput({
  label,
  description,
  value,
  unit,
  badgeColor,
  onChange,
}: ThresholdInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge className={`${badgeColor} text-white text-xs`}>
          {label.includes("ALARM") ? "ALARM" : "WARNING"}
        </Badge>
        <Label>{label}</Label>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-28"
        />
        <span className="text-sm text-muted-foreground font-mono">{unit}</span>
      </div>
    </div>
  );
}
