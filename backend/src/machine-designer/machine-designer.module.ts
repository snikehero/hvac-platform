import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MachineTypeEntity } from './entities/machine-type.entity';
import { MachineVariableEntity } from './entities/machine-variable.entity';
import { MachineDesignerService } from './machine-designer.service';
import { MachineDesignerController } from './machine-designer.controller';
import { MachineModule } from '../machine/machine.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MachineTypeEntity, MachineVariableEntity]),
    forwardRef(() => MachineModule),
  ],
  controllers: [MachineDesignerController],
  providers: [MachineDesignerService],
  exports: [MachineDesignerService],
})
export class MachineDesignerModule {}
