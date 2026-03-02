import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from 'typeorm';

@Entity('command_records')
@Index(['plantId', 'stationId', 'timestamp'])
export class CommandRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'command_id' })
  commandId: string;

  @Column({ name: 'plant_id' })
  plantId: string;

  @Column({ name: 'station_id' })
  stationId: string;

  @Column()
  command: 'fan_status' | 'damper_position';

  @Column({ type: 'text' })
  value: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'SUCCESS' | 'ERROR' | 'TIMEOUT';

  @Column({ name: 'operator_name', nullable: true })
  operatorName?: string;

  @Column({ nullable: true, type: 'text' })
  message?: string;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
