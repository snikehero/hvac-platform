import { useState } from "react";
import {
  useSettings,
  DEFAULT_SETTINGS,
  type HvacThresholds,
  type HvacNotifications,
  type HvacGeneral,
  type HvacDashboard,
  type DashboardWidgetConfig,
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
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";
import { audioManager } from "@/pages/HVAC/DashboardEjecutivoPage/3DDetailPage/presentation/Audio/AudioManager";
import { useTranslation } from "@/i18n/useTranslation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { DashboardWidgetRow } from "./DashboardWidgetRow";

export default function SettingsPage() {
  const {
    settings,
    updateThresholds,
    updateNotifications,
    updateGeneral,
    updateDashboard,
    resetToDefaults,
  } = useSettings();
  const { t, tf } = useTranslation();

  // Local draft state so we can show "unsaved" and batch saves
  const [thresholds, setThresholds] = useState<HvacThresholds>(
    settings.thresholds,
  );
  const [notifications, setNotifications] = useState<HvacNotifications>(
    settings.notifications,
  );
  const [general, setGeneral] = useState<HvacGeneral>(settings.general);
  const [dashboard, setDashboard] = useState<HvacDashboard>(settings.dashboard);

  const hasChanges =
    JSON.stringify(thresholds) !== JSON.stringify(settings.thresholds) ||
    JSON.stringify(notifications) !== JSON.stringify(settings.notifications) ||
    JSON.stringify(general) !== JSON.stringify(settings.general) ||
    JSON.stringify(dashboard) !== JSON.stringify(settings.dashboard);

  function handleSave() {
    updateThresholds(thresholds);
    updateNotifications(notifications);
    updateGeneral(general);
    updateDashboard(dashboard);
    toast.success(t.settings.toast.saved);
  }

  function handleReset() {
    setThresholds(DEFAULT_SETTINGS.thresholds);
    setNotifications(DEFAULT_SETTINGS.notifications);
    setGeneral(DEFAULT_SETTINGS.general);
    setDashboard(DEFAULT_SETTINGS.dashboard);
    resetToDefaults();
    toast.info(t.settings.toast.reset);
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

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setDashboard((prev) => {
      const oldIndex = prev.widgets.findIndex((w) => w.id === active.id);
      const newIndex = prev.widgets.findIndex((w) => w.id === over.id);
      return { widgets: arrayMove(prev.widgets, oldIndex, newIndex) };
    });
  }

  function handleToggleWidget(
    id: DashboardWidgetConfig["id"],
    visible: boolean,
  ) {
    setDashboard((prev) => ({
      widgets: prev.widgets.map((w) => (w.id === id ? { ...w, visible } : w)),
    }));
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
              {t.settings.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t.settings.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <Tabs defaultValue="thresholds" className="space-y-6">
        <TabsList>
          <TabsTrigger value="thresholds" className="gap-1.5">
            <Gauge className="w-4 h-4" />
            {t.settings.tabs.thresholds}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="w-4 h-4" />
            {t.settings.tabs.notifications}
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-1.5">
            <Globe className="w-4 h-4" />
            {t.settings.tabs.general}
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-1.5">
            <LayoutDashboard className="w-4 h-4" />
            {t.settings.dashboard.tabLabel}
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
                {t.settings.thresholds.temperature}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t.settings.thresholds.temperatureDesc}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ThresholdInput
                  label={t.settings.thresholds.warning}
                  description={tf(t.settings.thresholds.warningDesc, { metric: t.ahuCard.temperature.toLowerCase() })}
                  value={thresholds.temperatureWarning}
                  unit="°C"
                  badgeColor="bg-yellow-500"
                  onChange={(v) =>
                    setThresholds((p) => ({ ...p, temperatureWarning: v }))
                  }
                />
                <ThresholdInput
                  label={t.settings.thresholds.alarm}
                  description={tf(t.settings.thresholds.alarmDesc, { metric: t.ahuCard.temperature.toLowerCase() })}
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
                  {t.settings.thresholds.errorWarningAlarm}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Humedad */}
          <Card className="backdrop-blur-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Droplets className="w-5 h-5 text-cyan-500" />
                {t.settings.thresholds.humidity}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t.settings.thresholds.humidityDesc}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ThresholdInput
                  label={t.settings.thresholds.warning}
                  description={tf(t.settings.thresholds.warningDesc, { metric: t.ahuCard.humidity.toLowerCase() })}
                  value={thresholds.humidityWarning}
                  unit="%"
                  badgeColor="bg-yellow-500"
                  onChange={(v) =>
                    setThresholds((p) => ({ ...p, humidityWarning: v }))
                  }
                />
                <ThresholdInput
                  label={t.settings.thresholds.alarm}
                  description={tf(t.settings.thresholds.alarmDesc, { metric: t.ahuCard.humidity.toLowerCase() })}
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
                  {t.settings.thresholds.errorWarningAlarm}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Desconexión */}
          <Card className="backdrop-blur-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <WifiOff className="w-5 h-5 text-muted-foreground" />
                {t.settings.thresholds.disconnection}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t.settings.thresholds.disconnectionDesc}
              </p>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm space-y-2">
                <Label htmlFor="disconnect-timeout">{t.settings.thresholds.timeout}</Label>
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
                      ? `${(thresholds.disconnectTimeoutSeconds / 60).toFixed(1)} ${t.time.min}`
                      : `${thresholds.disconnectTimeoutSeconds}${t.time.sec}`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.settings.thresholds.currentValue}{" "}
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
                {t.settings.notifications.alarmSound}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t.settings.notifications.alarmSoundDesc}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.settings.notifications.soundEnabled}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t.settings.notifications.soundEnabledDesc}
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
                  <Label>{t.settings.notifications.volume}</Label>
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
                  <Label>{t.settings.notifications.testSound}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t.settings.notifications.testSoundDesc}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestSound}
                  disabled={!notifications.soundEnabled}
                >
                  <Play className="w-4 h-4 mr-1.5" />
                  {t.settings.notifications.play}
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
                {t.settings.general.preferences}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t.settings.general.preferencesDesc}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.settings.general.language}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t.settings.general.languageDesc}
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
                    <Label>{t.settings.general.refreshInterval}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.general.refreshIntervalDesc}
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
                  <span>1s ({t.settings.general.realTime})</span>
                  <span>30s ({t.settings.general.lowConsumption})</span>
                </div>
              </div>

              <Separator />

              {/* Operator Name */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.settings.general.operatorName}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t.settings.general.operatorNameDesc}
                  </p>
                </div>
                <Input
                  value={general.operatorName}
                  onChange={(e) =>
                    setGeneral((p) => ({ ...p, operatorName: e.target.value }))
                  }
                  placeholder={t.settings.general.operatorNamePlaceholder}
                  className="w-40"
                  maxLength={30}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===========================
            TAB 4 - DASHBOARD
           =========================== */}
        <TabsContent value="dashboard" className="space-y-6">
          <Card className="backdrop-blur-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                {t.settings.dashboard.layoutTitle}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t.settings.dashboard.layoutDesc}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {t.settings.dashboard.dragHint}
              </p>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={dashboard.widgets.map((w) => w.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {dashboard.widgets.map((widget) => (
                      <DashboardWidgetRow
                        key={widget.id}
                        widget={widget}
                        label={t.settings.dashboard.widgetLabels[widget.id]}
                        visibleLabel={t.settings.dashboard.visibleLabel}
                        onToggle={handleToggleWidget}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===== FOOTER ACTIONS ===== */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={handleReset} className="gap-1.5">
          <RotateCcw className="w-4 h-4" />
          {t.settings.resetDefaults}
        </Button>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="secondary" className="font-mono text-xs">
              {t.settings.unsavedChanges}
            </Badge>
          )}
          <Button onClick={handleSave} disabled={!hasChanges} className="gap-1.5">
            <Save className="w-4 h-4" />
            {t.settings.saveChanges}
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
