import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommandRecord } from '../entities/command-record.entity';

export interface CommandQueryOptions {
  plantId?: string;
  stationId?: string;
  startDate: Date;
  endDate: Date;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class CommandRepository {
  constructor(
    @InjectRepository(CommandRecord)
    private readonly repo: Repository<CommandRecord>,
  ) {}

  async saveCommand(record: Omit<CommandRecord, 'id' | 'createdAt'>): Promise<void> {
    await this.repo.insert(record);
  }

  async updateStatus(
    commandId: string,
    status: 'SUCCESS' | 'ERROR' | 'TIMEOUT',
    message?: string,
  ): Promise<void> {
    await this.repo.update({ commandId }, { status, message });
  }

  async queryByDateRange(options: CommandQueryOptions): Promise<{ data: CommandRecord[]; total: number }> {
    const { startDate, endDate, plantId, stationId, page = 1, pageSize = 200 } = options;

    const qb = this.repo
      .createQueryBuilder('c')
      .where('c.timestamp BETWEEN :start AND :end', { start: startDate, end: endDate })
      .orderBy('c.timestamp', 'DESC');

    if (plantId) qb.andWhere('c.plantId = :plantId', { plantId });
    if (stationId) qb.andWhere('c.stationId = :stationId', { stationId });

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
