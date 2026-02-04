/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get } from '@nestjs/common';
import { HvacService } from './hvac.service';

@Controller('hvac')
export class HvacController {
  constructor(private readonly hvacService: HvacService) {}

  @Get('latest')
  getLatest() {
    return this.hvacService.getLatestTelemetry();
  }
}
