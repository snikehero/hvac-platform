export type AggregationType = 'raw' | 'hourly' | 'daily';

export type AuditActionType =
  | 'COMMAND_SENT'
  | 'ALARM_ACKNOWLEDGED'
  | 'ALARM_CLEARED'
  | 'SETTINGS_CHANGED';

export interface TelemetryQueryParams {
  startDate: string;         // ISO date string
  endDate: string;           // ISO date string
  plantId?: string;
  stationId?: string;
  pointName?: string;
  aggregation?: AggregationType;
  page?: number;
  pageSize?: number;
}

export interface TelemetryRecord {
  id: string;
  plantId: string;
  stationId: string;
  pointName: string;
  value: string;
  unit?: string;
  quality: 'GOOD' | 'BAD' | 'UNCERTAIN';
  timestamp: string;
  createdAt: string;
}

export interface AggregatedPoint {
  bucket: string;
  plantId: string;
  stationId: string;
  pointName: string;
  avg: number;
  min: number;
  max: number;
  sum: number;
  count: number;
}

export interface EventRecord {
  id: string;
  plantId: string;
  ahuId: string;
  type: 'OK' | 'WARNING' | 'ALARM' | 'DISCONNECTED';
  previousType?: 'OK' | 'WARNING' | 'ALARM' | 'DISCONNECTED';
  message: string;
  timestamp: string;
  createdAt: string;
}

export interface CommandRecord {
  id: string;
  commandId: string;
  plantId: string;
  stationId: string;
  command: 'fan_status' | 'damper_position';
  value: string;
  status: 'pending' | 'SUCCESS' | 'ERROR' | 'TIMEOUT';
  operatorName?: string;
  message?: string;
  timestamp: string;
  createdAt: string;
}

export interface AuditRecord {
  id: string;
  actionType: AuditActionType;
  actor?: string;
  details?: Record<string, unknown>;
  plantId?: string;
  ahuId?: string;
  timestamp: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateAuditEntryParams {
  actionType: AuditActionType;
  actor?: string;
  details?: Record<string, unknown>;
  plantId?: string;
  ahuId?: string;
}
