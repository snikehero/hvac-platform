import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MachineTypeEntity } from './machine-type.entity';

@Entity('machine_variables')
export class MachineVariableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MachineTypeEntity, (mt) => mt.variables, {
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

  @Column({ default: 'number' })
  dataType: string;

  @Column({ nullable: true })
  unit: string;

  @Column({ default: 'generic' })
  cardType: string;

  @Column({ default: 'primary' })
  color: string;

  @Column({ default: 0 })
  displayOrder: number;

  @Column({ type: 'simple-json', nullable: true })
  cardConfig: Record<string, unknown>;
}
