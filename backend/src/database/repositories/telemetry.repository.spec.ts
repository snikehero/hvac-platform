import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TelemetryRepository } from './telemetry.repository';
import { TelemetryRecord } from '../entities/telemetry-record.entity';

const mockOrmRepo = () => ({
  insert: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockQb = () => ({
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getCount: jest.fn().mockResolvedValue(0),
  getMany: jest.fn().mockResolvedValue([]),
  getRawMany: jest.fn().mockResolvedValue([]),
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue({ affected: 0 }),
});

describe('TelemetryRepository', () => {
  let repo: TelemetryRepository;
  let ormRepo: jest.Mocked<Repository<TelemetryRecord>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelemetryRepository,
        {
          provide: getRepositoryToken(TelemetryRecord),
          useFactory: mockOrmRepo,
        },
      ],
    }).compile();

    repo = module.get<TelemetryRepository>(TelemetryRepository);
    ormRepo = module.get(getRepositoryToken(TelemetryRecord));
  });

  describe('saveTelemetry', () => {
    it('inserts one record per point', async () => {
      ormRepo.insert = jest.fn().mockResolvedValue(undefined);

      await repo.saveTelemetry({
        plantId: 'plant-1',
        stationId: 'ahu-1',
        timestamp: '2024-01-01T00:00:00.000Z',
        points: {
          temperature: { value: 22.5, unit: '°C', quality: 'GOOD' },
          humidity: { value: 60, unit: '%', quality: 'GOOD' },
        },
      });

      expect(ormRepo.insert).toHaveBeenCalledTimes(1);
      const inserted = (ormRepo.insert as jest.Mock).mock.calls[0][0] as unknown[];
      expect(inserted).toHaveLength(2);
    });

    it('stores value as string', async () => {
      ormRepo.insert = jest.fn().mockResolvedValue(undefined);

      await repo.saveTelemetry({
        plantId: 'plant-1',
        stationId: 'ahu-1',
        timestamp: '2024-01-01T00:00:00.000Z',
        points: {
          fan: { value: true },
        },
      });

      const inserted = (ormRepo.insert as jest.Mock).mock.calls[0][0] as Array<{ value: string }>;
      expect(inserted[0].value).toBe('true');
    });

    it('defaults quality to GOOD when not provided', async () => {
      ormRepo.insert = jest.fn().mockResolvedValue(undefined);

      await repo.saveTelemetry({
        plantId: 'p1',
        stationId: 's1',
        timestamp: new Date().toISOString(),
        points: { temp: { value: 25 } },
      });

      const inserted = (ormRepo.insert as jest.Mock).mock.calls[0][0] as Array<{ quality: string }>;
      expect(inserted[0].quality).toBe('GOOD');
    });
  });

  describe('queryRange', () => {
    it('returns paginated results with total', async () => {
      const qb = mockQb();
      qb.getCount.mockResolvedValue(50);
      qb.getMany.mockResolvedValue([{ id: '1' } as TelemetryRecord]);
      ormRepo.createQueryBuilder = jest.fn().mockReturnValue(qb);

      const result = await repo.queryRange({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-02'),
        page: 1,
        pageSize: 10,
      });

      expect(result.total).toBe(50);
      expect(result.data).toHaveLength(1);
    });

    it('applies plantId filter when provided', async () => {
      const qb = mockQb();
      ormRepo.createQueryBuilder = jest.fn().mockReturnValue(qb);

      await repo.queryRange({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-02'),
        plantId: 'plant-1',
      });

      expect(qb.andWhere).toHaveBeenCalledWith('t.plantId = :plantId', { plantId: 'plant-1' });
    });
  });

  describe('deleteOlderThan', () => {
    it('returns number of deleted rows', async () => {
      const qb = mockQb();
      qb.execute.mockResolvedValue({ affected: 42 });
      ormRepo.createQueryBuilder = jest.fn().mockReturnValue(qb);

      const count = await repo.deleteOlderThan(new Date('2024-01-01'));
      expect(count).toBe(42);
    });
  });
});
