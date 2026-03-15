import { Module, forwardRef } from '@nestjs/common';
import { MqttModule } from '../mqtt/mqtt.module';
import { MachineDesignerModule } from '../machine-designer/machine-designer.module';
import { CommandsService } from './commands.service';
import { CommandsGateway } from './commands.gateway';

@Module({
  imports: [MqttModule, forwardRef(() => MachineDesignerModule)],
  providers: [CommandsService, CommandsGateway],
})
export class CommandsModule {}
