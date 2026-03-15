import { PartialType } from '@nestjs/mapped-types';
import { CreateMachineTypeDto } from './create-machine-type.dto';

export class UpdateMachineTypeDto extends PartialType(CreateMachineTypeDto) {}
