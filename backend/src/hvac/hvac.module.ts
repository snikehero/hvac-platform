import { Module } from '@nestjs/common';
import { MqttModule } from '../mqtt/mqtt.module';
import { HvacService } from './hvac.service';
import { HvacGateway } from './hvac.gateway';
import { HvacController } from './hvac.controller';

@Module({
  imports: [MqttModule],
  controllers: [HvacController],
  providers: [HvacService, HvacGateway],
  exports: [HvacService],
})
export class HvacModule {}
