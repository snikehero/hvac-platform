import { Module, forwardRef } from '@nestjs/common';
import { MqttModule } from '../mqtt/mqtt.module';
import { MachineDesignerModule } from '../machine-designer/machine-designer.module';
import { MachineService } from './machine.service';
import { MachineGateway } from './machine.gateway';
import { MachineController } from './machine.controller';

@Module({
  imports: [MqttModule, forwardRef(() => MachineDesignerModule)],
  controllers: [MachineController],
  providers: [MachineService, MachineGateway],
  exports: [MachineService],
})
export class MachineModule {}
