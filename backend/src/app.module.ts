import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HvacModule } from './hvac/hvac.module';
import { MqttModule } from './mqtt/mqtt.module';
import { CommandsModule } from './commands/commands.module';
import { DatabaseModule } from './database/database.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    HistoryModule,
    HvacModule,
    MqttModule,
    CommandsModule,
  ],
})
export class AppModule {}
