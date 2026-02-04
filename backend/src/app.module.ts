import { Module } from '@nestjs/common';
import { MqttModule } from './mqtt/mqtt.module';
import { HvacModule } from './hvac/hvac.module';

@Module({
  imports: [MqttModule, HvacModule],
})
export class AppModule {}
