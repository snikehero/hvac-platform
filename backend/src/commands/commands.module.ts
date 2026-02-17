import { Module } from '@nestjs/common';
import { MqttModule } from '../mqtt/mqtt.module';
import { CommandsService } from './commands.service';
import { CommandsGateway } from './commands.gateway';

@Module({
  imports: [MqttModule],
  providers: [CommandsService, CommandsGateway],
})
export class CommandsModule {}
