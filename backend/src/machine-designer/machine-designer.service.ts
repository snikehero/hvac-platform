import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MachineTypeEntity } from './entities/machine-type.entity';
import { MachineVariableEntity } from './entities/machine-variable.entity';
import { CreateMachineTypeDto } from './dto/create-machine-type.dto';
import { UpdateMachineTypeDto } from './dto/update-machine-type.dto';

@Injectable()
export class MachineDesignerService {
  private readonly logger = new Logger(MachineDesignerService.name);

  constructor(
    @InjectRepository(MachineTypeEntity)
    private readonly machineTypeRepo: Repository<MachineTypeEntity>,
    @InjectRepository(MachineVariableEntity)
    private readonly machineVariableRepo: Repository<MachineVariableEntity>,
  ) {}

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
    await this.machineTypeRepo.remove(existing);
    this.logger.log(
      `Deleted machine type "${existing.name}" (${existing.slug})`,
    );
    // Restore id since TypeORM removes it after .remove()
    existing.id = id;
    return existing;
  }
}
