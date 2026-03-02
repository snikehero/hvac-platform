import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { TelemetryRepository } from './repositories/telemetry.repository';
import { EventRepository } from './repositories/event.repository';
import { CommandRepository } from './repositories/command.repository';
import { AuditRepository } from './repositories/audit.repository';

@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly telemetryRepo: TelemetryRepository,
    private readonly eventRepo: EventRepository,
    private readonly commandRepo: CommandRepository,
    private readonly auditRepo: AuditRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async runRetentionPolicy(): Promise<void> {
    const retentionDays = this.config.get<number>('DATA_RETENTION_DAYS', 90);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);

    this.logger.log(`Running retention policy — purging records older than ${cutoff.toISOString()}`);

    const [telemetryDeleted, eventsDeleted, commandsDeleted, auditDeleted] = await Promise.all([
      this.telemetryRepo.deleteOlderThan(cutoff),
      this.eventRepo.deleteOlderThan(cutoff),
      this.commandRepo.deleteOlderThan(cutoff),
      this.auditRepo.deleteOlderThan(cutoff),
    ]);

    this.logger.log(
      `Retention complete — telemetry: ${telemetryDeleted}, events: ${eventsDeleted}, commands: ${commandsDeleted}, audit: ${auditDeleted}`,
    );
  }
}
