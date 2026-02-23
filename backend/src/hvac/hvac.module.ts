import { Module } from '@nestjs/common';
import { HvacService } from './hvac.service';
import { HvacGateway } from './hvac.gateway';
import { HvacController } from './hvac.controller';

@Module({
  controllers: [HvacController],
  providers: [HvacService, HvacGateway],
  exports: [HvacService],
})
export class HvacModule {}
