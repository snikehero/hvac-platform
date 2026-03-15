import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Inject,
  forwardRef,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MachineDesignerService } from './machine-designer.service';
import { MachineService } from '../machine/machine.service';
import { CreateMachineTypeDto } from './dto/create-machine-type.dto';
import { UpdateMachineTypeDto } from './dto/update-machine-type.dto';

@Controller('api/machine-types')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class MachineDesignerController {
  constructor(
    private readonly service: MachineDesignerService,
    @Inject(forwardRef(() => MachineService))
    private readonly machineService: MachineService,
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Post()
  async create(@Body() dto: CreateMachineTypeDto) {
    const saved = await this.service.create(dto);
    this.machineService.registerMachineType(saved.slug, saved.mqttTopic);
    return saved;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMachineTypeDto) {
    const result = await this.service.update(id, dto);
    const oldTopic = (result as any)._oldTopic as string;

    if (dto.mqttTopic && dto.mqttTopic !== oldTopic) {
      this.machineService.updateMachineType(
        result.slug,
        oldTopic,
        result.mqttTopic,
      );
    }

    // Remove internal field before returning
    const { _oldTopic, ...clean } = result as any;
    return clean;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const removed = await this.service.remove(id);
    this.machineService.unregisterMachineType(removed.slug, removed.mqttTopic);
    return removed;
  }
}
