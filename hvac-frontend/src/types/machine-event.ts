export type MachineEventType = "OK" | "DISCONNECTED" | "RECONNECTED";
export interface MachineEvent {
    timestamp: string;
    machineType: string;
    instanceId: string; // stationId
    plantId: string;
    type: MachineEventType;
    previousType?: MachineEventType;
    message: string;
}
