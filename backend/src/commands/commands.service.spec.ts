import { Test, TestingModule } from '@nestjs/testing';
import { CommandsService } from './commands.service';
import { MqttService } from '../mqtt/mqtt.service';
import { Socket } from 'socket.io';

const mockMqttService = {
  publish: jest.fn(),
  registerResponseHandler: jest.fn(),
};

const makeSocket = (): jest.Mocked<Pick<Socket, 'emit'>> => ({ emit: jest.fn() });

describe('CommandsService', () => {
  let service: CommandsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useRealTimers();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommandsService,
        { provide: MqttService, useValue: mockMqttService },
      ],
    }).compile();

    service = module.get<CommandsService>(CommandsService);
    // Manually trigger onModuleInit to register the response handler
    service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executeCommand', () => {
    it('publishes to the correct MQTT topic and returns a commandId', () => {
      const socket = makeSocket() as unknown as Socket;
      const commandId = service.executeCommand(
        { plantId: 'plant-1', stationId: 'ahu-1', command: 'fan_status', value: 'ON' },
        socket,
      );

      expect(typeof commandId).toBe('string');
      expect(commandId.length).toBeGreaterThan(0);
      expect(mockMqttService.publish).toHaveBeenCalledTimes(1);
      expect(mockMqttService.publish.mock.calls[0][0]).toBe(
        'hvac/plant-1/ahu-1/commands/set',
      );
    });
  });

  describe('handleResponse', () => {
    it('resolves a pending command and emits command:result to the socket', () => {
      const socket = makeSocket() as unknown as Socket;
      const commandId = service.executeCommand(
        { plantId: 'plant-1', stationId: 'ahu-1', command: 'fan_status', value: 'ON' },
        socket,
      );

      service.handleResponse({
        commandId,
        status: 'SUCCESS',
        message: 'OK',
        timestamp: new Date().toISOString(),
      });

      expect(socket.emit).toHaveBeenCalledWith(
        'command:result',
        expect.objectContaining({ commandId, status: 'SUCCESS' }),
      );
    });

    it('logs a warning and does not throw for an unknown commandId', () => {
      expect(() =>
        service.handleResponse({
          commandId: 'unknown-id',
          status: 'ERROR',
          message: 'nope',
          timestamp: new Date().toISOString(),
        }),
      ).not.toThrow();
    });
  });

  describe('timeout', () => {
    it('emits TIMEOUT to the socket after 10 seconds with no device response', () => {
      jest.useFakeTimers();
      const socket = makeSocket() as unknown as Socket;

      const commandId = service.executeCommand(
        { plantId: 'plant-1', stationId: 'ahu-1', command: 'damper_position', value: 50 },
        socket,
      );

      jest.advanceTimersByTime(10_000);

      expect(socket.emit).toHaveBeenCalledWith(
        'command:result',
        expect.objectContaining({ commandId, status: 'TIMEOUT' }),
      );

      jest.runAllTimers();
      jest.useRealTimers();
    });
  });
});
