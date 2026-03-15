import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MachineVariableEntity } from './machine-variable.entity';

@Entity('machine_types')
export class MachineTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  mqttTopic: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MachineVariableEntity, (v) => v.machineType, {
    cascade: true,
    eager: true,
  })
  variables: MachineVariableEntity[];
}
