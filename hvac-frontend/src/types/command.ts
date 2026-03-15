export type CommandStatus = 'idle' | 'pending' | 'success' | 'error' | 'timeout';

export interface CommandRequest {
  machineType: string;
  plantId: string;
  stationId: string;
  command: string;
  value: string | number;
}

export interface CommandAcknowledged {
  commandId: string;
  timestamp: string;
}

export interface CommandResult {
  commandId: string;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT';
  message?: string;
  timestamp: string;
}
