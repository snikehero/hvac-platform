import { Module } from '@nestjs/common';
import { HvacService } from './hvac.service';
import { HvacGateway } from './hvac.gateway';

@Module({
  providers: [HvacService, HvacGateway],
  exports: [HvacService],
})
export class HvacModule {}
