import { toast } from "sonner";
import type { HvacEventType } from "@/types/event";
import type { DeviceEventType } from "@/types/device-event";
import { translations, type Language } from "@/i18n/translations";

/**
 * Service responsible for displaying toast notifications for status changes
 */
export class NotificationService {
  /* ---- HVAC-specific (delegates to generic) ---- */

  static notifyStatusChange(
    stationId: string,
    plantId: string,
    status: HvacEventType,
    previousStatus?: HvacEventType,
    language: Language = "es",
  ): void {
    NotificationService.notifyDeviceStatusChange(
      "HVAC",
      stationId,
      plantId,
      status as DeviceEventType,
      previousStatus as DeviceEventType | undefined,
      language,
    );
  }

  static notifyDisconnection(
    stationId: string,
    plantId: string,
    timeoutMinutes: number = 2,
    language: Language = "es",
  ): void {
    const t = translations[language];
    const n = (t as any).notifications;
    const deviceMsg = (n.deviceDisconnected ?? n.ahuDisconnected)
      .replace("{stationId}", stationId)
      .replace("{machineType}", "HVAC");
    toast.error(deviceMsg, {
      description: `${n.plant.replace("{plantId}", plantId)} - ${n.noDataTimeout.replace("{minutes}", String(timeoutMinutes))}`,
      duration: 3000,
    });
  }

  static notifyReconnection(
    stationId: string,
    plantId: string,
    language: Language = "es",
  ): void {
    const t = translations[language];
    const n = (t as any).notifications;
    const deviceMsg = (n.deviceReconnected ?? n.ahuReconnected)
      .replace("{stationId}", stationId)
      .replace("{machineType}", "HVAC");
    toast.success(deviceMsg, {
      description: n.plant.replace("{plantId}", plantId),
      duration: 4000,
    });
  }

  /* ---- Generic device notifications ---- */

  static notifyDeviceStatusChange(
    machineTypeName: string,
    instanceId: string,
    plantId: string,
    status: DeviceEventType,
    previousStatus?: DeviceEventType,
    language: Language = "es",
  ): void {
    const t = translations[language];
    const n = (t as any).notifications;

    const replace = (template: string) =>
      template
        .replace("{stationId}", instanceId)
        .replace("{machineType}", machineTypeName);

    if (status === "ALARM") {
      toast.error(replace(n.deviceAlarm ?? n.ahuAlarm), {
        description: n.plant.replace("{plantId}", plantId),
        duration: 3000,
      });
    } else if (status === "WARNING") {
      toast.warning(replace(n.deviceWarning ?? n.ahuWarning), {
        description: n.plant.replace("{plantId}", plantId),
        duration: 3000,
      });
    } else if (status === "OK" && previousStatus === "ALARM") {
      toast.success(replace(n.deviceNormal ?? n.ahuNormal), {
        description: n.plant.replace("{plantId}", plantId),
        duration: 3000,
      });
    } else if (status === "DISCONNECTED") {
      toast.error(replace(n.deviceDisconnected ?? n.ahuDisconnected), {
        description: n.plant.replace("{plantId}", plantId),
        duration: 3000,
      });
    } else if (status === "RECONNECTED") {
      toast.success(replace(n.deviceReconnected ?? n.ahuReconnected), {
        description: n.plant.replace("{plantId}", plantId),
        duration: 4000,
      });
    }
  }
}
