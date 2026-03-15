import type { HvacPoint } from "./telemetry";

export interface MachineVariable {
  id: string;
  key: string;
  label: string;
  dataType: "number" | "string" | "boolean";
  unit?: string;
  cardType: string;
  color: string;
  displayOrder: number;
  cardConfig?: Record<string, unknown>;
}

export interface MachineType {
  id: string;
  name: string;
  slug: string;
  mqttTopic: string;
  description?: string;
  icon?: string;
  variables: MachineVariable[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MachineTelemetry {
  machineType: string;
  plantId: string;
  stationId: string;
  timestamp: string;
  points: Record<string, HvacPoint>;
}

export interface CreateMachineVariablePayload {
  key: string;
  label: string;
  dataType: "number" | "string" | "boolean";
  unit?: string;
  cardType?: string;
  color?: string;
  displayOrder?: number;
  cardConfig?: Record<string, unknown>;
}

export interface CreateMachineTypePayload {
  name: string;
  slug: string;
  mqttTopic: string;
  description?: string;
  icon?: string;
  variables: CreateMachineVariablePayload[];
}

export type UpdateMachineTypePayload = Partial<CreateMachineTypePayload>;
