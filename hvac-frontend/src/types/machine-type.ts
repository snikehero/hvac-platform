export type Quality = "GOOD" | "BAD" | "UNCERTAIN";

export interface MachinePoint {
  value: number | string | boolean;
  unit?: string;
  quality?: Quality;
}

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

export interface MachineCommand {
  id: string;
  key: string;
  label: string;
  commandType: "toggle" | "range" | "select";
  config?: Record<string, unknown>;
  displayOrder: number;
}

export interface MachineType {
  id: string;
  name: string;
  slug: string;
  mqttTopic: string;
  description?: string;
  icon?: string;
  variables: MachineVariable[];
  commands: MachineCommand[];
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MachineTelemetry {
  machineType: string;
  plantId: string;
  stationId: string;
  timestamp: string;
  points: Record<string, MachinePoint>;
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

export interface CreateMachineCommandPayload {
  key: string;
  label: string;
  commandType: "toggle" | "range" | "select";
  config?: Record<string, unknown>;
  displayOrder?: number;
}

export interface CreateMachineTypePayload {
  name: string;
  slug: string;
  mqttTopic: string;
  description?: string;
  icon?: string;
  variables: CreateMachineVariablePayload[];
  commands?: CreateMachineCommandPayload[];
}

export type UpdateMachineTypePayload = Partial<CreateMachineTypePayload>;
