import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from 'typeorm';

@Entity('event_records')
@Index(['plantId', 'ahuId', 'timestamp'])
export class EventRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'plant_id' })
  plantId: string;

  @Column({ name: 'ahu_id' })
  ahuId: string;

  @Column()
  type: 'OK' | 'WARNING' | 'ALARM' | 'DISCONNECTED';

  @Column({ name: 'previous_type', nullable: true })
  previousType?: 'OK' | 'WARNING' | 'ALARM' | 'DISCONNECTED';

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
