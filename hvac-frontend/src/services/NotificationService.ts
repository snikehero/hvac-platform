import { toast } from "sonner";
import type { HvacEventType } from "@/types/event";
import { translations, type Language } from "@/i18n/translations";

/**
 * Service responsible for displaying toast notifications for status changes
 */
export class NotificationService {
  static notifyStatusChange(
    stationId: string,
    plantId: string,
    status: HvacEventType,
    previousStatus?: HvacEventType,
    language: Language = "es",
  ): void {
    const t = translations[language];

    if (status === "ALARM") {
      toast.error(`🚨 ${t.notifications.ahuAlarm.replace("{stationId}", stationId)}`, {
        description: t.notifications.plant.replace("{plantId}", plantId),
        duration: 3000,
      });
    } else if (status === "WARNING") {
      toast.warning(`⚠ ${t.notifications.ahuWarning.replace("{stationId}", stationId)}`, {
        description: t.notifications.plant.replace("{plantId}", plantId),
        duration: 3000,
      });
    } else if (status === "OK" && previousStatus === "ALARM") {
      toast.success(`✅ ${t.notifications.ahuNormal.replace("{stationId}", stationId)}`, {
        description: t.notifications.plant.replace("{plantId}", plantId),
        duration: 3000,
      });
    }
  }

  static notifyDisconnection(
    stationId: string,
    plantId: string,
    timeoutMinutes: number = 2,
    language: Language = "es",
  ): void {
    const t = translations[language];
    toast.error(`🔴 ${t.notifications.ahuDisconnected.replace("{stationId}", stationId)}`, {
      description: `${t.notifications.plant.replace("{plantId}", plantId)} - ${t.notifications.noDataTimeout.replace("{minutes}", String(timeoutMinutes))}`,
      duration: 3000,
    });
  }

  static notifyReconnection(
    stationId: string,
    plantId: string,
    language: Language = "es",
  ): void {
    const t = translations[language];
    toast.success(`🟢 ${t.notifications.ahuReconnected.replace("{stationId}", stationId)}`, {
      description: t.notifications.plant.replace("{plantId}", plantId),
      duration: 4000,
    });
  }
}
