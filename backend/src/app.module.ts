import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MqttModule } from './mqtt/mqtt.module';
import { CommandsModule } from './commands/commands.module';
import { MachineDesignerModule } from './machine-designer/machine-designer.module';
import { MachineModule } from './machine/machine.module';
import { MachineTypeEntity } from './machine-designer/entities/machine-type.entity';
import { MachineVariableEntity } from './machine-designer/entities/machine-variable.entity';
import { MachineCommandEntity } from './machine-designer/entities/machine-command.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'data/machine-designer.sqlite',
      entities: [MachineTypeEntity, MachineVariableEntity, MachineCommandEntity],
      synchronize: true,
    }),
    MqttModule,
    CommandsModule,
    MachineDesignerModule,
    MachineModule,
  ],
})
export class AppModule {}
