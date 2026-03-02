import { Controller, Get, Post, Query, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { HistoryService } from './history.service';
import {
  TelemetryQueryDto,
  EventQueryDto,
  CommandQueryDto,
  AuditQueryDto,
  CreateAuditEntryDto,
} from './dto/history-query.dto';

@Controller('history')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('telemetry')
  getTelemetry(@Query() query: TelemetryQueryDto) {
    return this.historyService.getTelemetry(query);
  }

  @Get('telemetry/aggregate')
  getAggregatedTelemetry(@Query() query: TelemetryQueryDto) {
    return this.historyService.getAggregatedTelemetry(query);
  }

  @Get('events')
  getEvents(@Query() query: EventQueryDto) {
    return this.historyService.getEvents(query);
  }

  @Get('commands')
  getCommands(@Query() query: CommandQueryDto) {
    return this.historyService.getCommands(query);
  }

  @Get('audit')
  getAuditLog(@Query() query: AuditQueryDto) {
    return this.historyService.getAuditLog(query);
  }

  @Post('audit')
  createAuditEntry(@Body() body: CreateAuditEntryDto) {
    return this.historyService.createAuditEntry(body);
  }
}
