import { Test, TestingModule } from '@nestjs/testing';
import { HvacGateway } from './hvac.gateway';
import { HvacService } from './hvac.service';
import { TelemetryDto } from './dto/telemetry.dto';
import { Socket } from 'socket.io';

const mockSnapshot: TelemetryDto[] = [
  {
    plantId: 'plant-1',
    stationId: 'ahu-1',
    timestamp: new Date().toISOString(),
    points: { supply_temp: { value: 22.5, unit: '°C', quality: 'GOOD' } },
  },
];

const mockHvacService = { getSnapshot: jest.fn(() => mockSnapshot) };

describe('HvacGateway', () => {
  let gateway: HvacGateway;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HvacGateway,
        { provide: HvacService, useValue: mockHvacService },
      ],
    }).compile();

    gateway = module.get<HvacGateway>(HvacGateway);
    // Attach a mock server so emitUpdate can be tested
    (gateway as any).server = { emit: jest.fn() };
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('emits hvac_snapshot with the current state to the connecting client', () => {
      const mockClient = { emit: jest.fn() } as unknown as Socket;
      gateway.handleConnection(mockClient);

      expect(mockHvacService.getSnapshot).toHaveBeenCalledTimes(1);
      expect(mockClient.emit).toHaveBeenCalledWith('hvac_snapshot', mockSnapshot);
    });
  });

  describe('emitUpdate', () => {
    it('broadcasts hvac_update to all connected clients', () => {
      const dto: TelemetryDto = mockSnapshot[0];
      gateway.emitUpdate(dto);

      expect((gateway as any).server.emit).toHaveBeenCalledWith('hvac_update', dto);
    });
  });
});
