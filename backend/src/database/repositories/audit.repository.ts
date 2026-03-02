import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditRecord, AuditActionType } from '../entities/audit-record.entity';

export interface AuditQueryOptions {
  actionType?: AuditActionType;
  actor?: string;
  plantId?: string;
  ahuId?: string;
  startDate: Date;
  endDate: Date;
  page?: number;
  pageSize?: number;
}

export interface CreateAuditDto {
  actionType: AuditActionType;
  actor?: string;
  details?: Record<string, unknown>;
  plantId?: string;
  ahuId?: string;
}

@Injectable()
export class AuditRepository {
  constructor(
    @InjectRepository(AuditRecord)
    private readonly repo: Repository<AuditRecord>,
  ) {}

  async saveAudit(dto: CreateAuditDto): Promise<AuditRecord> {
    const record = this.repo.create({
      ...dto,
      timestamp: new Date(),
    });
    return this.repo.save(record);
  }

  async queryFiltered(options: AuditQueryOptions): Promise<{ data: AuditRecord[]; total: number }> {
    const { startDate, endDate, actionType, actor, plantId, ahuId, page = 1, pageSize = 200 } = options;

    const qb = this.repo
      .createQueryBuilder('a')
      .where('a.timestamp BETWEEN :start AND :end', { start: startDate, end: endDate })
      .orderBy('a.timestamp', 'DESC');

    if (actionType) qb.andWhere('a.actionType = :actionType', { actionType });
    if (actor) qb.andWhere('a.actor ILIKE :actor', { actor: `%${actor}%` });
    if (plantId) qb.andWhere('a.plantId = :plantId', { plantId });
    if (ahuId) qb.andWhere('a.ahuId = :ahuId', { ahuId });

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return { data, total };
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .where('timestamp < :date', { date })
      .execute();

    return result.affected ?? 0;
  }
}
