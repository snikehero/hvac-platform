import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MachineTypeEntity } from './machine-type.entity';

@Entity('machine_commands')
export class MachineCommandEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MachineTypeEntity, (mt) => mt.commands, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'machineTypeId' })
  machineType: MachineTypeEntity;

  @Column()
  machineTypeId: string;

  @Column()
  key: string;

  @Column()
  label: string;

  @Column({ default: 'toggle' })
  commandType: string;

  @Column({ type: 'simple-json', nullable: true })
  config: Record<string, unknown>;

  @Column({ default: 0 })
  displayOrder: number;
}
