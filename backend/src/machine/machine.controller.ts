import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { MachineService } from './machine.service';

@ApiTags('Machine Snapshots')
@Controller('machines')
export class MachineController {
  constructor(private readonly machineService: MachineService) {}

  @Get('snapshot')
  @ApiOperation({ summary: 'Get latest telemetry snapshot for all machine types' })
  @ApiResponse({ status: 200, description: 'Map of machineType → array of instance snapshots' })
  getAllSnapshots() {
    return this.machineService.getSnapshotAll();
  }

  @Get(':machineType/snapshot')
  @ApiOperation({ summary: 'Get latest telemetry snapshot for a specific machine type' })
  @ApiParam({ name: 'machineType', description: 'Machine type slug (e.g. "hvac")' })
  @ApiResponse({ status: 200, description: 'Array of instance snapshots for the machine type' })
  getSnapshot(@Param('machineType') machineType: string) {
    return this.machineService.getSnapshot(machineType);
  }
}
