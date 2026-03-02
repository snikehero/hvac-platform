import { Test, TestingModule } from '@nestjs/testing';
import { HvacService } from './hvac.service';
import { HvacGateway } from './hvac.gateway';
import { TelemetryDto } from './dto/telemetry.dto';
import { TelemetryRepository } from '../database/repositories/telemetry.repository';

const mockGateway = { emitUpdate: jest.fn() };
const mockTelemetryRepository = { saveTelemetry: jest.fn().mockResolvedValue(undefined) };

const basePayload = (): TelemetryDto => ({
  plantId: 'plant-1',
  stationId: 'ahu-1',
  timestamp: new Date().toISOString(),
  points: {
    supply_temp: { value: 22.5, unit: '°C', quality: 'GOOD' },
    fan_status: { value: true },
  },
});

describe('HvacService', () => {
  let service: HvacService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HvacService,
        { provide: HvacGateway, useValue: mockGateway },
        { provide: TelemetryRepository, useValue: mockTelemetryRepository },
      ],
    }).compile();

    service = module.get<HvacService>(HvacService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleTelemetry', () => {
    it('stores the AHU state and calls emitUpdate', () => {
      const payload = basePayload();
      service.handleTelemetry(payload);

      expect(mockGateway.emitUpdate).toHaveBeenCalledTimes(1);
      const emitted: TelemetryDto = mockGateway.emitUpdate.mock.calls[0][0];
      expect(emitted.plantId).toBe('plant-1');
      expect(emitted.stationId).toBe('ahu-1');
      expect(emitted.points['supply_temp'].value).toBe(22.5);
    });

    it('merges a second telemetry message into the same state entry', () => {
      service.handleTelemetry(basePayload());

      const update = basePayload();
      update.points = { supply_temp: { value: 24.0, unit: '°C', quality: 'GOOD' } };
      service.handleTelemetry(update);

      const snapshot = service.getSnapshot();
      expect(snapshot).toHaveLength(1);
      expect(snapshot[0].points['supply_temp'].value).toBe(24.0);
      // fan_status from first message is still present
      expect(snapshot[0].points['fan_status']).toBeDefined();
    });

    it('creates separate state entries for different stationIds', () => {
      service.handleTelemetry(basePayload());

      const other = basePayload();
      other.stationId = 'ahu-2';
      service.handleTelemetry(other);

      expect(service.getSnapshot()).toHaveLength(2);
    });
  });

  describe('getSnapshot', () => {
    it('returns empty array when no telemetry has been received', () => {
      expect(service.getSnapshot()).toEqual([]);
    });

    it('returns a TelemetryDto array matching stored state', () => {
      service.handleTelemetry(basePayload());
      const snapshot = service.getSnapshot();

      expect(snapshot).toHaveLength(1);
      expect(snapshot[0]).toMatchObject({
        plantId: 'plant-1',
        stationId: 'ahu-1',
      });
      expect(typeof snapshot[0].timestamp).toBe('string');
    });
  });
});
