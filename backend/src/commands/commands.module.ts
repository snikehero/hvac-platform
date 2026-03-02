import { Module } from '@nestjs/common';
import { MqttModule } from '../mqtt/mqtt.module';
import { DatabaseModule } from '../database/database.module';
import { CommandsService } from './commands.service';
import { CommandsGateway } from './commands.gateway';

@Module({
  imports: [MqttModule, DatabaseModule],
  providers: [CommandsService, CommandsGateway],
})
export class CommandsModule {}
