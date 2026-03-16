import { toast } from "sonner";
import type { DeviceEventType } from "@/types/device-event";
import { translations, type Language } from "@/i18n/translations";

/**
 * Service responsible for displaying toast notifications for status changes
 */
export class NotificationService {
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
      toast.error(replace(n.deviceAlarm), {
        description: n.plant.replace("{plantId}", plantId),
        duration: 3000,
      });
    } else if (status === "WARNING") {
      toast.warning(replace(n.deviceWarning), {
        description: n.plant.replace("{plantId}", plantId),
        duration: 3000,
      });
    } else if (status === "OK" && previousStatus === "ALARM") {
      toast.success(replace(n.deviceNormal), {
        description: n.plant.replace("{plantId}", plantId),
        duration: 3000,
      });
    } else if (status === "DISCONNECTED") {
      toast.error(replace(n.deviceDisconnected), {
        description: n.plant.replace("{plantId}", plantId),
        duration: 3000,
      });
    } else if (status === "RECONNECTED") {
      toast.success(replace(n.deviceReconnected), {
        description: n.plant.replace("{plantId}", plantId),
        duration: 4000,
      });
    }
  }
}
