export type DeviceEventType =
  | "OK"
  | "WARNING"
  | "ALARM"
  | "DISCONNECTED"
  | "RECONNECTED";

export interface DeviceEvent {
  timestamp: string;
  machineType: string;
  instanceId: string;
  plantId: string;
  type: DeviceEventType;
  previousType?: DeviceEventType;
  message: string;
}
