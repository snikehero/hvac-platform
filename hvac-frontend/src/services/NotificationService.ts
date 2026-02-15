import { toast } from "sonner";
import type { HvacEventType } from "@/types/event";

/**
 * Service responsible for displaying toast notifications for status changes
 */
export class NotificationService {
  static notifyStatusChange(
    stationId: string,
    plantId: string,
    status: HvacEventType,
    previousStatus?: HvacEventType,
  ): void {
    if (status === "ALARM") {
      toast.error(`🚨 AHU ${stationId} en ALARMA`, {
        description: `Planta ${plantId}`,
        duration: 3000,
      });
    } else if (status === "WARNING") {
      toast.warning(`⚠ AHU ${stationId} en WARNING`, {
        description: `Planta ${plantId}`,
        duration: 3000,
      });
    } else if (status === "OK" && previousStatus === "ALARM") {
      toast.success(`✅ AHU ${stationId} volvió a NORMAL`, {
        description: `Planta ${plantId}`,
        duration: 3000,
      });
    }
  }

  static notifyDisconnection(stationId: string, plantId: string): void {
    toast.error(`🔴 AHU ${stationId} desconectado`, {
      description: `Planta ${plantId} - Sin datos por más de 2 minutos`,
      duration: 3000,
    });
  }

  static notifyReconnection(stationId: string, plantId: string): void {
    toast.success(`🟢 AHU ${stationId} reconectado`, {
      description: `Planta ${plantId}`,
      duration: 4000,
    });
  }
}
