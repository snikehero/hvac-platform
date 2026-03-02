import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, SelectQueryBuilder } from 'typeorm';
import { TelemetryRecord } from '../entities/telemetry-record.entity';
import { TelemetryDto } from '../../hvac/dto/telemetry.dto';

export type AggregationType = 'raw' | 'hourly' | 'daily';

export interface TelemetryQueryOptions {
  plantId?: string;
  stationId?: string;
  pointName?: string;
  startDate: Date;
  endDate: Date;
  aggregation?: AggregationType;
  page?: number;
  pageSize?: number;
}

export interface AggregatedPoint {
  bucket: string;
  plantId: string;
  stationId: string;
  pointName: string;
  avg: number;
  min: number;
  max: number;
  sum: number;
  count: number;
}

@Injectable()
export class TelemetryRepository {
  constructor(
    @InjectRepository(TelemetryRecord)
    private readonly repo: Repository<TelemetryRecord>,
  ) {}

  async saveTelemetry(dto: TelemetryDto): Promise<void> {
    const records: Partial<TelemetryRecord>[] = Object.entries(dto.points).map(
      ([pointName, point]) => ({
        plantId: dto.plantId,
        stationId: dto.stationId,
        pointName,
        value: String(point.value),
        unit: point.unit,
        quality: point.quality ?? 'GOOD',
        timestamp: new Date(dto.timestamp),
      }),
    );

    await this.repo.insert(records);
  }

  async queryRange(options: TelemetryQueryOptions): Promise<{ data: TelemetryRecord[]; total: number }> {
    const { startDate, endDate, plantId, stationId, pointName, page = 1, pageSize = 500 } = options;

    const qb: SelectQueryBuilder<TelemetryRecord> = this.repo
      .createQueryBuilder('t')
      .where('t.timestamp BETWEEN :start AND :end', { start: startDate, end: endDate })
      .orderBy('t.timestamp', 'ASC');

    if (plantId) qb.andWhere('t.plantId = :plantId', { plantId });
    if (stationId) qb.andWhere('t.stationId = :stationId', { stationId });
    if (pointName) qb.andWhere('t.pointName = :pointName', { pointName });

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return { data, total };
  }

  async aggregate(options: TelemetryQueryOptions): Promise<AggregatedPoint[]> {
    const { startDate, endDate, plantId, stationId, pointName, aggregation = 'hourly' } = options;

    const truncUnit = aggregation === 'daily' ? 'day' : 'hour';

    const qb = this.repo
      .createQueryBuilder('t')
      .select(`DATE_TRUNC('${truncUnit}', t.timestamp)`, 'bucket')
      .addSelect('t.plantId', 'plantId')
      .addSelect('t.stationId', 'stationId')
      .addSelect('t.pointName', 'pointName')
      .addSelect('AVG(CAST(t.value AS DOUBLE PRECISION))', 'avg')
      .addSelect('MIN(CAST(t.value AS DOUBLE PRECISION))', 'min')
      .addSelect('MAX(CAST(t.value AS DOUBLE PRECISION))', 'max')
      .addSelect('SUM(CAST(t.value AS DOUBLE PRECISION))', 'sum')
      .addSelect('COUNT(*)', 'count')
      .where('t.timestamp BETWEEN :start AND :end', { start: startDate, end: endDate })
      .andWhere(`t.value ~ '^-?[0-9]+(\\.[0-9]+)?$'`) // only numeric values
      .groupBy(`DATE_TRUNC('${truncUnit}', t.timestamp), t.plantId, t.stationId, t.pointName`)
      .orderBy('bucket', 'ASC');

    if (plantId) qb.andWhere('t.plantId = :plantId', { plantId });
    if (stationId) qb.andWhere('t.stationId = :stationId', { stationId });
    if (pointName) qb.andWhere('t.pointName = :pointName', { pointName });

    return qb.getRawMany() as Promise<AggregatedPoint[]>;
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
