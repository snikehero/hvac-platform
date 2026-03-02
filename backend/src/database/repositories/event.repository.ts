import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventRecord } from '../entities/event-record.entity';

export interface EventQueryOptions {
  plantId?: string;
  ahuId?: string;
  startDate: Date;
  endDate: Date;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class EventRepository {
  constructor(
    @InjectRepository(EventRecord)
    private readonly repo: Repository<EventRecord>,
  ) {}

  async saveEvent(event: Omit<EventRecord, 'id' | 'createdAt'>): Promise<void> {
    await this.repo.insert(event);
  }

  async queryByDateRange(options: EventQueryOptions): Promise<{ data: EventRecord[]; total: number }> {
    const { startDate, endDate, plantId, ahuId, page = 1, pageSize = 200 } = options;

    const qb = this.repo
      .createQueryBuilder('e')
      .where('e.timestamp BETWEEN :start AND :end', { start: startDate, end: endDate })
      .orderBy('e.timestamp', 'DESC');

    if (plantId) qb.andWhere('e.plantId = :plantId', { plantId });
    if (ahuId) qb.andWhere('e.ahuId = :ahuId', { ahuId });

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
