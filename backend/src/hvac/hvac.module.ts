import { Module } from '@nestjs/common';
import { HvacService } from './hvac.service';
import { HvacController } from './hvac.controller';
import { HvacGateway } from './hvac.gateway';

@Module({
  providers: [HvacService, HvacGateway],
  controllers: [HvacController],
  exports: [HvacService, HvacGateway],
})
export class HvacModule {}
