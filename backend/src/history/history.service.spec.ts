import { Test, TestingModule } from '@nestjs/testing';
import { HistoryService } from './history.service';
import { TelemetryRepository } from '../database/repositories/telemetry.repository';
import { EventRepository } from '../database/repositories/event.repository';
import { CommandRepository } from '../database/repositories/command.repository';
import { AuditRepository } from '../database/repositories/audit.repository';

const mockTelemetryRepo = { queryRange: jest.fn(), aggregate: jest.fn() };
const mockEventRepo = { queryByDateRange: jest.fn() };
const mockCommandRepo = { queryByDateRange: jest.fn() };
const mockAuditRepo = { queryFiltered: jest.fn(), saveAudit: jest.fn() };

describe('HistoryService', () => {
  let service: HistoryService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        { provide: TelemetryRepository, useValue: mockTelemetryRepo },
        { provide: EventRepository, useValue: mockEventRepo },
        { provide: CommandRepository, useValue: mockCommandRepo },
        { provide: AuditRepository, useValue: mockAuditRepo },
      ],
    }).compile();

    service = module.get<HistoryService>(HistoryService);
  });

  describe('getTelemetry', () => {
    it('returns paginated response with correct totalPages', async () => {
      mockTelemetryRepo.queryRange.mockResolvedValue({ data: [], total: 55 });

      const result = await service.getTelemetry({
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        page: 1,
        pageSize: 10,
      });

      expect(result.totalPages).toBe(6);
      expect(result.total).toBe(55);
    });

    it('passes date range to repository', async () => {
      mockTelemetryRepo.queryRange.mockResolvedValue({ data: [], total: 0 });

      await service.getTelemetry({
        startDate: '2024-06-01T00:00:00Z',
        endDate: '2024-06-30T23:59:59Z',
      });

      const call = mockTelemetryRepo.queryRange.mock.calls[0][0] as { startDate: Date; endDate: Date };
      expect(call.startDate).toEqual(new Date('2024-06-01T00:00:00Z'));
      expect(call.endDate).toEqual(new Date('2024-06-30T23:59:59Z'));
    });
  });

  describe('getAggregatedTelemetry', () => {
    it('defaults to hourly aggregation', async () => {
      mockTelemetryRepo.aggregate.mockResolvedValue([]);

      await service.getAggregatedTelemetry({
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-02T00:00:00Z',
      });

      const call = mockTelemetryRepo.aggregate.mock.calls[0][0] as { aggregation: string };
      expect(call.aggregation).toBe('hourly');
    });
  });

  describe('createAuditEntry', () => {
    it('delegates to audit repository', async () => {
      const entry = { id: 'abc', actionType: 'COMMAND_SENT' };
      mockAuditRepo.saveAudit.mockResolvedValue(entry);

      const result = await service.createAuditEntry({
        actionType: 'COMMAND_SENT',
        actor: 'operator-1',
        plantId: 'plant-1',
      });

      expect(mockAuditRepo.saveAudit).toHaveBeenCalledWith({
        actionType: 'COMMAND_SENT',
        actor: 'operator-1',
        plantId: 'plant-1',
      });
      expect(result).toBe(entry);
    });
  });
});
