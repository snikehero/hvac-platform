import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Cpu,
  Gauge,
  Bell,
  Volume2,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMachineTypes } from "@/context/MachineTypeContext";
import { useMachineSettings } from "@/hooks/useMachineSettings";
import { routes } from "@/router/routes";
import { useTranslation } from "@/i18n/useTranslation";

export default function MachineSettingsPage() {
  const { machineType: slug } = useParams<{ machineType: string }>();
  const navigate = useNavigate();
  const { machineTypes } = useMachineTypes();
  const {
    settings,
    updateThresholds,
    updateNotifications,
    resetToDefaults,
    defaults,
  } = useMachineSettings(slug ?? "");
  const { t, tf } = useTranslation();

  const machineType = useMemo(
    () => machineTypes.find((mt) => mt.slug === slug),
    [machineTypes, slug],
  );

  const numericVariables = useMemo(
    () =>
      machineType
        ? machineType.variables
            .filter((v) => v.dataType === "number")
            .filter((v) => {
              const cfg = v.cardConfig as Record<string, unknown> | null;
              return cfg && (cfg.warning != null || cfg.alarm != null);
            })
            .sort((a, b) => a.displayOrder - b.displayOrder)
        : [],
    [machineType],
  );

  if (!machineType) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t.machinePages.machineTypeNotFound}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(routes.machine.home(slug!))}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t.machinePages.back}
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{machineType.name} {t.machinePages.settings}</h1>
            <p className="text-sm text-muted-foreground">
              {t.machinePages.configureThresholds}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="thresholds" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="thresholds">
            <Gauge className="w-4 h-4 mr-2" />
            {t.machinePages.thresholds}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            {t.machinePages.notificationsTab}
          </TabsTrigger>
        </TabsList>

        {/* Thresholds Tab */}
        <TabsContent value="thresholds" className="space-y-4">
          {numericVariables.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                {t.machinePages.noThresholdVars}
              </CardContent>
            </Card>
          ) : (
            <>
              {numericVariables.map((v) => {
                const th = settings.thresholds[v.key] ?? {};
                const def = defaults.thresholds[v.key] ?? {};
                return (
                  <Card key={v.key} className="border-border bg-card/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-primary" />
                        {v.label}
                        {v.unit && (
                          <Badge variant="outline" className="text-xs">
                            {v.unit}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-yellow-500">
                            {t.machinePages.warningThreshold}
                          </label>
                          <input
                            type="number"
                            value={th.warning ?? ""}
                            placeholder={
                              def.warning != null ? tf(t.machinePages.defaultValue, { value: def.warning }) : t.machinePages.notSet
                            }
                            onChange={(e) =>
                              updateThresholds(v.key, {
                                warning: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              })
                            }
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-destructive">
                            {t.machinePages.alarmThreshold}
                          </label>
                          <input
                            type="number"
                            value={th.alarm ?? ""}
                            placeholder={
                              def.alarm != null ? tf(t.machinePages.defaultValue, { value: def.alarm }) : t.machinePages.notSet
                            }
                            onChange={(e) =>
                              updateThresholds(v.key, {
                                alarm: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              })
                            }
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToDefaults}
                >
                  <RotateCcw className="w-3 h-3 mr-2" />
                  {t.machinePages.resetDefaults}
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-border bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-primary" />
                {t.machinePages.soundNotifications}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t.machinePages.enableSound}</span>
                <button
                  onClick={() =>
                    updateNotifications({
                      soundEnabled: !settings.notifications.soundEnabled,
                    })
                  }
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${settings.notifications.soundEnabled ? "bg-primary" : "bg-muted"}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-background transition-transform
                      ${settings.notifications.soundEnabled ? "translate-x-6" : "translate-x-1"}
                    `}
                  />
                </button>
              </div>

              {settings.notifications.soundEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t.machinePages.volume}</span>
                    <span className="text-sm font-mono text-muted-foreground">
                      {Math.round(settings.notifications.soundVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={settings.notifications.soundVolume}
                    onChange={(e) =>
                      updateNotifications({
                        soundVolume: Number(e.target.value),
                      })
                    }
                    className="w-full h-2 rounded-full accent-primary cursor-pointer"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
