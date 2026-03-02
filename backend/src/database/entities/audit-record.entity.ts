import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from 'typeorm';

export type AuditActionType =
  | 'COMMAND_SENT'
  | 'ALARM_ACKNOWLEDGED'
  | 'ALARM_CLEARED'
  | 'SETTINGS_CHANGED';

@Entity('audit_records')
@Index(['timestamp'])
@Index(['actor', 'timestamp'])
@Index(['actionType', 'timestamp'])
export class AuditRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'action_type' })
  actionType: AuditActionType;

  @Column({ nullable: true })
  actor?: string;

  @Column({ type: 'jsonb', nullable: true })
  details?: Record<string, unknown>;

  @Column({ name: 'plant_id', nullable: true })
  plantId?: string;

  @Column({ name: 'ahu_id', nullable: true })
  ahuId?: string;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
