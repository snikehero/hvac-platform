import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { HvacModule } from '../hvac/hvac.module';

@Module({
  imports: [HvacModule],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
