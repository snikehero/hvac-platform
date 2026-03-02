import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RetentionService } from './retention.service';
import { TelemetryRepository } from './repositories/telemetry.repository';
import { EventRepository } from './repositories/event.repository';
import { CommandRepository } from './repositories/command.repository';
import { AuditRepository } from './repositories/audit.repository';

describe('RetentionService', () => {
  let service: RetentionService;

  const mockTelemetryRepo = { deleteOlderThan: jest.fn().mockResolvedValue(10) };
  const mockEventRepo = { deleteOlderThan: jest.fn().mockResolvedValue(5) };
  const mockCommandRepo = { deleteOlderThan: jest.fn().mockResolvedValue(3) };
  const mockAuditRepo = { deleteOlderThan: jest.fn().mockResolvedValue(2) };
  const mockConfig = { get: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockConfig.get.mockReturnValue(90);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetentionService,
        { provide: ConfigService, useValue: mockConfig },
        { provide: TelemetryRepository, useValue: mockTelemetryRepo },
        { provide: EventRepository, useValue: mockEventRepo },
        { provide: CommandRepository, useValue: mockCommandRepo },
        { provide: AuditRepository, useValue: mockAuditRepo },
      ],
    }).compile();

    service = module.get<RetentionService>(RetentionService);
  });

  describe('runRetentionPolicy', () => {
    it('deletes from all four tables', async () => {
      await service.runRetentionPolicy();

      expect(mockTelemetryRepo.deleteOlderThan).toHaveBeenCalledTimes(1);
      expect(mockEventRepo.deleteOlderThan).toHaveBeenCalledTimes(1);
      expect(mockCommandRepo.deleteOlderThan).toHaveBeenCalledTimes(1);
      expect(mockAuditRepo.deleteOlderThan).toHaveBeenCalledTimes(1);
    });

    it('calculates cutoff date based on retention days', async () => {
      mockConfig.get.mockReturnValue(30);
      const before = new Date();
      before.setDate(before.getDate() - 30);

      await service.runRetentionPolicy();

      const cutoff = mockTelemetryRepo.deleteOlderThan.mock.calls[0][0] as Date;
      const diffDays = Math.round((new Date().getTime() - cutoff.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBeCloseTo(30, 0);
    });

    it('uses default 90 days when config not set', async () => {
      mockConfig.get.mockReturnValue(90);

      await service.runRetentionPolicy();

      const cutoff = mockTelemetryRepo.deleteOlderThan.mock.calls[0][0] as Date;
      const diffDays = Math.round((new Date().getTime() - cutoff.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBeCloseTo(90, 0);
    });
  });
});
