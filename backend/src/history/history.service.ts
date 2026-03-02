import { Injectable } from '@nestjs/common';
import { TelemetryRepository } from '../database/repositories/telemetry.repository';
import { EventRepository } from '../database/repositories/event.repository';
import { CommandRepository } from '../database/repositories/command.repository';
import { AuditRepository, CreateAuditDto } from '../database/repositories/audit.repository';
import {
  TelemetryQueryDto,
  EventQueryDto,
  CommandQueryDto,
  AuditQueryDto,
} from './dto/history-query.dto';
import { PaginatedResponseDto } from './dto/history-response.dto';
import { TelemetryRecord } from '../database/entities/telemetry-record.entity';
import { EventRecord } from '../database/entities/event-record.entity';
import { CommandRecord } from '../database/entities/command-record.entity';
import { AuditRecord } from '../database/entities/audit-record.entity';
import { AggregatedPoint } from '../database/repositories/telemetry.repository';

@Injectable()
export class HistoryService {
  constructor(
    private readonly telemetryRepo: TelemetryRepository,
    private readonly eventRepo: EventRepository,
    private readonly commandRepo: CommandRepository,
    private readonly auditRepo: AuditRepository,
  ) {}

  async getTelemetry(dto: TelemetryQueryDto): Promise<PaginatedResponseDto<TelemetryRecord>> {
    const { data, total } = await this.telemetryRepo.queryRange({
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      plantId: dto.plantId,
      stationId: dto.stationId,
      pointName: dto.pointName,
      page: dto.page,
      pageSize: dto.pageSize,
    });

    return new PaginatedResponseDto(data, total, dto.page ?? 1, dto.pageSize ?? 500);
  }

  async getAggregatedTelemetry(dto: TelemetryQueryDto): Promise<AggregatedPoint[]> {
    return this.telemetryRepo.aggregate({
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      plantId: dto.plantId,
      stationId: dto.stationId,
      pointName: dto.pointName,
      aggregation: dto.aggregation ?? 'hourly',
    });
  }

  async getEvents(dto: EventQueryDto): Promise<PaginatedResponseDto<EventRecord>> {
    const { data, total } = await this.eventRepo.queryByDateRange({
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      plantId: dto.plantId,
      ahuId: dto.ahuId,
      page: dto.page,
      pageSize: dto.pageSize,
    });

    return new PaginatedResponseDto(data, total, dto.page ?? 1, dto.pageSize ?? 200);
  }

  async getCommands(dto: CommandQueryDto): Promise<PaginatedResponseDto<CommandRecord>> {
    const { data, total } = await this.commandRepo.queryByDateRange({
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      plantId: dto.plantId,
      stationId: dto.stationId,
      page: dto.page,
      pageSize: dto.pageSize,
    });

    return new PaginatedResponseDto(data, total, dto.page ?? 1, dto.pageSize ?? 200);
  }

  async getAuditLog(dto: AuditQueryDto): Promise<PaginatedResponseDto<AuditRecord>> {
    const { data, total } = await this.auditRepo.queryFiltered({
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      actionType: dto.actionType,
      actor: dto.actor,
      plantId: dto.plantId,
      ahuId: dto.ahuId,
      page: dto.page,
      pageSize: dto.pageSize,
    });

    return new PaginatedResponseDto(data, total, dto.page ?? 1, dto.pageSize ?? 200);
  }

  async createAuditEntry(dto: CreateAuditDto): Promise<AuditRecord> {
    return this.auditRepo.saveAudit(dto);
  }
}
