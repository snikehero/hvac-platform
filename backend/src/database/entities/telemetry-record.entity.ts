import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from 'typeorm';

@Entity('telemetry_records')
@Index(['plantId', 'stationId', 'timestamp'])
@Index(['pointName', 'timestamp'])
export class TelemetryRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'plant_id' })
  plantId: string;

  @Column({ name: 'station_id' })
  stationId: string;

  @Column({ name: 'point_name' })
  pointName: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ nullable: true })
  unit?: string;

  @Column({ default: 'GOOD' })
  quality: 'GOOD' | 'BAD' | 'UNCERTAIN';

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
