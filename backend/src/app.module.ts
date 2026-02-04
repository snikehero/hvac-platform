import { Module } from '@nestjs/common';
import { HvacModule } from './hvac/hvac.module';
import { MqttModule } from './mqtt/mqtt.module';

@Module({
  imports: [HvacModule, MqttModule],
})
export class AppModule {}
