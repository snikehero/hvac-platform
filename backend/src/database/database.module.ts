import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelemetryRecord } from './entities/telemetry-record.entity';
import { EventRecord } from './entities/event-record.entity';
import { CommandRecord } from './entities/command-record.entity';
import { AuditRecord } from './entities/audit-record.entity';
import { TelemetryRepository } from './repositories/telemetry.repository';
import { EventRepository } from './repositories/event.repository';
import { CommandRepository } from './repositories/command.repository';
import { AuditRepository } from './repositories/audit.repository';
import { RetentionService } from './retention.service';

const entities = [TelemetryRecord, EventRecord, CommandRecord, AuditRecord];
const repositories = [TelemetryRepository, EventRepository, CommandRepository, AuditRepository];

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'hvac_user'),
        password: config.get<string>('DB_PASSWORD', 'hvac_pass'),
        database: config.get<string>('DB_NAME', 'hvac'),
        entities,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: config.get<string>('NODE_ENV') === 'development',
        retryAttempts: 5,
        retryDelay: 3000,
      }),
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [...repositories, RetentionService],
  exports: [TypeOrmModule, ...repositories],
})
export class DatabaseModule {}
