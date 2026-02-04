import { Controller, Get } from '@nestjs/common';
import { HvacService } from './hvac.service';
import { TelemetryDto } from './dto/telemetry.dto';

@Controller('hvac')
export class HvacController {
  constructor(private readonly hvacService: HvacService) {}

  @Get('snapshot')
  getSnapshot(): TelemetryDto[] {
    return this.hvacService.getSnapshot();
  }
}
