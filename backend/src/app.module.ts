import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HvacModule } from './hvac/hvac.module';
import { MqttModule } from './mqtt/mqtt.module';
import { CommandsModule } from './commands/commands.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HvacModule,
    MqttModule,
    CommandsModule,
  ],
})
export class AppModule {}
