import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MachineTypeEntity } from './entities/machine-type.entity';
import { MachineVariableEntity } from './entities/machine-variable.entity';
import { MachineCommandEntity } from './entities/machine-command.entity';
import { CreateMachineTypeDto } from './dto/create-machine-type.dto';
import { UpdateMachineTypeDto } from './dto/update-machine-type.dto';

@Injectable()
export class MachineDesignerService implements OnModuleInit {
  private readonly logger = new Logger(MachineDesignerService.name);

  constructor(
    @InjectRepository(MachineTypeEntity)
    private readonly machineTypeRepo: Repository<MachineTypeEntity>,
    @InjectRepository(MachineVariableEntity)
    private readonly machineVariableRepo: Repository<MachineVariableEntity>,
    @InjectRepository(MachineCommandEntity)
    private readonly machineCommandRepo: Repository<MachineCommandEntity>,
  ) {}

  async onModuleInit() {
    await this.ensureSystemTypes();
  }

  /**
   * Ensure system machine types (e.g. HVAC) exist in the database.
   * Idempotent — safe to call multiple times.
   * Called from onModuleInit AND from MachineService to handle init ordering.
   */
  async ensureSystemTypes() {
    const existing = await this.machineTypeRepo.findOne({ where: { slug: 'hvac' } });
    if (existing) {
      this.logger.log('System type "hvac" already exists, skipping seed');
      return;
    }

    const hvacType = this.machineTypeRepo.create({
      name: 'HVAC',
      slug: 'hvac',
      mqttTopic: 'hvac/#',
      description: 'Air Handling Unit monitoring and control',
      icon: 'AirVent',
      isSystem: true,
      variables: [
        this.machineVariableRepo.create({ key: 'temperature', label: 'Temperature', dataType: 'number', unit: '°C', cardType: 'temperature', color: '#3b82f6', displayOrder: 0, cardConfig: { warning: 28, alarm: 35, trackHistory: true } }),
        this.machineVariableRepo.create({ key: 'humidity', label: 'Humidity', dataType: 'number', unit: '%', cardType: 'humidity', color: '#06b6d4', displayOrder: 1, cardConfig: { warning: 70, alarm: 85, trackHistory: true } }),
        this.machineVariableRepo.create({ key: 'fan_status', label: 'Fan Status', dataType: 'boolean', cardType: 'fan', color: '#22c55e', displayOrder: 2, cardConfig: {} }),
        this.machineVariableRepo.create({ key: 'airflow', label: 'Airflow', dataType: 'number', unit: 'm³/h', cardType: 'airflow', color: '#8b5cf6', displayOrder: 3, cardConfig: {} }),
        this.machineVariableRepo.create({ key: 'damper_position', label: 'Damper Position', dataType: 'number', unit: '%', cardType: 'damper', color: '#f59e0b', displayOrder: 4, cardConfig: {} }),
        this.machineVariableRepo.create({ key: 'power_status', label: 'Power Status', dataType: 'boolean', cardType: 'power', color: '#ef4444', displayOrder: 5, cardConfig: {} }),
        this.machineVariableRepo.create({ key: 'filter_dp', label: 'Filter ΔP', dataType: 'number', unit: 'Pa', cardType: 'filter', color: '#64748b', displayOrder: 6, cardConfig: {} }),
        this.machineVariableRepo.create({ key: 'status', label: 'Status', dataType: 'string', cardType: 'generic', color: '#6b7280', displayOrder: 7, cardConfig: {} }),
      ],
      commands: [
        this.machineCommandRepo.create({ key: 'fan_status', label: 'Fan Control', commandType: 'toggle', config: { onLabel: 'ON', offLabel: 'OFF' }, displayOrder: 0 }),
        this.machineCommandRepo.create({ key: 'damper_position', label: 'Damper Position', commandType: 'range', config: { min: 0, max: 100, step: 5, unit: '%' }, displayOrder: 1 }),
      ],
    });

    await this.machineTypeRepo.save(hvacType);
    this.logger.log('Seeded system type "HVAC" with 8 variables and 2 commands');
  }

  async findAll(): Promise<MachineTypeEntity[]> {
    return this.machineTypeRepo.find({
      order: { createdAt: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<MachineTypeEntity> {
    const mt = await this.machineTypeRepo.findOne({ where: { slug } });
    if (!mt) {
      throw new NotFoundException(`Machine type "${slug}" not found`);
    }
    return mt;
  }

  async findById(id: string): Promise<MachineTypeEntity> {
    const mt = await this.machineTypeRepo.findOne({ where: { id } });
    if (!mt) {
      throw new NotFoundException(`Machine type with id "${id}" not found`);
    }
    return mt;
  }

  async create(dto: CreateMachineTypeDto): Promise<MachineTypeEntity> {
    const existing = await this.machineTypeRepo.findOne({
      where: [{ slug: dto.slug }, { name: dto.name }],
    });
    if (existing) {
      throw new ConflictException(
        `Machine type with slug "${dto.slug}" or name "${dto.name}" already exists`,
      );
    }

    const machineType = this.machineTypeRepo.create({
      name: dto.name,
      slug: dto.slug,
      mqttTopic: dto.mqttTopic,
      description: dto.description,
      icon: dto.icon,
      variables: dto.variables.map((v, i) =>
        this.machineVariableRepo.create({
          key: v.key,
          label: v.label,
          dataType: v.dataType ?? 'number',
          unit: v.unit,
          cardType: v.cardType ?? 'generic',
          color: v.color ?? 'primary',
          displayOrder: v.displayOrder ?? i,
          cardConfig: v.cardConfig,
        }),
      ),
      commands: (dto.commands ?? []).map((c, i) =>
        this.machineCommandRepo.create({
          key: c.key,
          label: c.label,
          commandType: c.commandType ?? 'toggle',
          config: c.config,
          displayOrder: c.displayOrder ?? i,
        }),
      ),
    });

    const saved = await this.machineTypeRepo.save(machineType);
    this.logger.log(`Created machine type "${saved.name}" (${saved.slug})`);
    return saved;
  }

  async update(
    id: string,
    dto: UpdateMachineTypeDto,
  ): Promise<MachineTypeEntity> {
    const existing = await this.findById(id);
    const oldTopic = existing.mqttTopic;

    if (dto.variables !== undefined) {
      // Remove old variables and replace with new ones
      await this.machineVariableRepo.delete({ machineTypeId: id });
      existing.variables = dto.variables.map((v, i) =>
        this.machineVariableRepo.create({
          machineTypeId: id,
          key: v.key,
          label: v.label,
          dataType: v.dataType ?? 'number',
          unit: v.unit,
          cardType: v.cardType ?? 'generic',
          color: v.color ?? 'primary',
          displayOrder: v.displayOrder ?? i,
          cardConfig: v.cardConfig,
        }),
      );
    }

    if (dto.commands !== undefined) {
      await this.machineCommandRepo.delete({ machineTypeId: id });
      existing.commands = dto.commands.map((c, i) =>
        this.machineCommandRepo.create({
          machineTypeId: id,
          key: c.key,
          label: c.label,
          commandType: c.commandType ?? 'toggle',
          config: c.config,
          displayOrder: c.displayOrder ?? i,
        }),
      );
    }

    if (dto.name !== undefined) existing.name = dto.name;
    if (dto.slug !== undefined) existing.slug = dto.slug;
    if (dto.mqttTopic !== undefined) existing.mqttTopic = dto.mqttTopic;
    if (dto.description !== undefined) existing.description = dto.description;
    if (dto.icon !== undefined) existing.icon = dto.icon;

    const saved = await this.machineTypeRepo.save(existing);
    this.logger.log(`Updated machine type "${saved.name}" (${saved.slug})`);

    return { ...saved, _oldTopic: oldTopic } as MachineTypeEntity & {
      _oldTopic: string;
    };
  }

  async remove(id: string): Promise<MachineTypeEntity> {
    const existing = await this.findById(id);
    if (existing.isSystem) {
      throw new ForbiddenException('Cannot delete system machine type');
    }
    await this.machineTypeRepo.remove(existing);
    this.logger.log(
      `Deleted machine type "${existing.name}" (${existing.slug})`,
    );
    // Restore id since TypeORM removes it after .remove()
    existing.id = id;
    return existing;
  }
}
