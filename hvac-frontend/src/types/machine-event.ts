/** @deprecated Use DeviceEventType from "@/types/device-event" instead */
export type MachineEventType = "OK" | "DISCONNECTED" | "RECONNECTED";
/** @deprecated Use DeviceEvent from "@/types/device-event" instead */
export interface MachineEvent {
    timestamp: string;
    machineType: string;
    instanceId: string; // stationId
    plantId: string;
    type: MachineEventType;
    previousType?: MachineEventType;
    message: string;
}
