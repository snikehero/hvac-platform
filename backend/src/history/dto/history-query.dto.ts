import { IsDateString, IsIn, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AuditActionType } from '../../database/entities/audit-record.entity';

export class TelemetryQueryDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  plantId?: string;

  @IsOptional()
  @IsString()
  stationId?: string;

  @IsOptional()
  @IsString()
  pointName?: string;

  @IsOptional()
  @IsIn(['raw', 'hourly', 'daily'])
  aggregation?: 'raw' | 'hourly' | 'daily';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  pageSize?: number = 500;
}

export class EventQueryDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  plantId?: string;

  @IsOptional()
  @IsString()
  ahuId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  pageSize?: number = 200;
}

export class CommandQueryDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  plantId?: string;

  @IsOptional()
  @IsString()
  stationId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  pageSize?: number = 200;
}

export class AuditQueryDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsIn(['COMMAND_SENT', 'ALARM_ACKNOWLEDGED', 'ALARM_CLEARED', 'SETTINGS_CHANGED'])
  actionType?: AuditActionType;

  @IsOptional()
  @IsString()
  actor?: string;

  @IsOptional()
  @IsString()
  plantId?: string;

  @IsOptional()
  @IsString()
  ahuId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  pageSize?: number = 200;
}

export class CreateAuditEntryDto {
  @IsIn(['COMMAND_SENT', 'ALARM_ACKNOWLEDGED', 'ALARM_CLEARED', 'SETTINGS_CHANGED'])
  actionType: AuditActionType;

  @IsOptional()
  @IsString()
  actor?: string;

  @IsOptional()
  details?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  plantId?: string;

  @IsOptional()
  @IsString()
  ahuId?: string;
}
