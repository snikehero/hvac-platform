export class CommandRequestDto {
  plantId: string;
  stationId: string;
  command: 'fan_status' | 'damper_position';
  value: string | number;
}

export class CommandResultDto {
  commandId: string;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT';
  message?: string;
  timestamp: string;
}
