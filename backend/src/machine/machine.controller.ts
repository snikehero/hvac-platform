import { Controller, Get, Param } from '@nestjs/common';
import { MachineService } from './machine.service';

@Controller('machines')
export class MachineController {
  constructor(private readonly machineService: MachineService) {}

  @Get('snapshot')
  getAllSnapshots() {
    return this.machineService.getSnapshotAll();
  }

  @Get(':machineType/snapshot')
  getSnapshot(@Param('machineType') machineType: string) {
    return this.machineService.getSnapshot(machineType);
  }
}
