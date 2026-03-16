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
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { MachineDesignerService } from './machine-designer.service';
import { MachineService } from '../machine/machine.service';
import { CreateMachineTypeDto } from './dto/create-machine-type.dto';
import { UpdateMachineTypeDto } from './dto/update-machine-type.dto';

@ApiTags('Machine Types')
@Controller('api/machine-types')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class MachineDesignerController {
  constructor(
    private readonly service: MachineDesignerService,
    @Inject(forwardRef(() => MachineService))
    private readonly machineService: MachineService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all machine types' })
  @ApiResponse({ status: 200, description: 'Array of machine type definitions' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a machine type by slug' })
  @ApiParam({ name: 'slug', description: 'Machine type slug (e.g. "hvac")' })
  @ApiResponse({ status: 200, description: 'Machine type definition' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new machine type' })
  @ApiResponse({ status: 201, description: 'Created machine type' })
  async create(@Body() dto: CreateMachineTypeDto) {
    const saved = await this.service.create(dto);
    this.machineService.registerMachineType(saved.slug, saved.mqttTopic);
    return saved;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a machine type' })
  @ApiParam({ name: 'id', description: 'Machine type database ID' })
  @ApiResponse({ status: 200, description: 'Updated machine type' })
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
  @ApiOperation({ summary: 'Delete a machine type' })
  @ApiParam({ name: 'id', description: 'Machine type database ID' })
  @ApiResponse({ status: 200, description: 'Deleted machine type' })
  async remove(@Param('id') id: string) {
    const removed = await this.service.remove(id);
    this.machineService.unregisterMachineType(removed.slug, removed.mqttTopic);
    return removed;
  }
}
