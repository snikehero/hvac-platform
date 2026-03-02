import type {
  TelemetryQueryParams,
  TelemetryRecord,
  AggregatedPoint,
  EventRecord,
  CommandRecord,
  AuditRecord,
  PaginatedResponse,
  CreateAuditEntryParams,
} from '@/types/history-api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
}

async function get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = `${BASE_URL}${path}${params ? buildQuery(params) : ''}`;
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) {
    throw new Error(`History API error ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`History API error ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export function fetchTelemetryHistory(
  params: TelemetryQueryParams,
): Promise<PaginatedResponse<TelemetryRecord>> {
  return get('/history/telemetry', params as unknown as Record<string, string | number | undefined>);
}

export function fetchAggregated(
  params: TelemetryQueryParams,
): Promise<AggregatedPoint[]> {
  return get('/history/telemetry/aggregate', params as unknown as Record<string, string | number | undefined>);
}

export function fetchEvents(params: {
  startDate: string;
  endDate: string;
  plantId?: string;
  ahuId?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<EventRecord>> {
  return get('/history/events', params as Record<string, string | number | undefined>);
}

export function fetchCommands(params: {
  startDate: string;
  endDate: string;
  plantId?: string;
  stationId?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<CommandRecord>> {
  return get('/history/commands', params as Record<string, string | number | undefined>);
}

export function fetchAuditLog(params: {
  startDate: string;
  endDate: string;
  actionType?: string;
  actor?: string;
  plantId?: string;
  ahuId?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<AuditRecord>> {
  return get('/history/audit', params as Record<string, string | number | undefined>);
}

export function postAuditEntry(dto: CreateAuditEntryParams): Promise<AuditRecord> {
  return post('/history/audit', dto);
}
