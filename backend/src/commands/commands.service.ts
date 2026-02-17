import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MqttService } from '../mqtt/mqtt.service';
import { CommandRequestDto, CommandResultDto } from './dto/command.dto';

interface PendingCommand {
  socket: Socket;
  timer: NodeJS.Timeout;
}

@Injectable()
export class CommandsService implements OnModuleInit {
  private readonly logger = new Logger(CommandsService.name);
  private readonly pending = new Map<string, PendingCommand>();

  constructor(private readonly mqttService: MqttService) {}

  onModuleInit() {
    this.mqttService.registerResponseHandler((_topic, payload) => {
      this.handleResponse(payload as CommandResultDto);
    });
  }

  executeCommand(dto: CommandRequestDto, socket: Socket): string {
    const commandId = crypto.randomUUID();
    const topic = `hvac/${dto.plantId}/${dto.stationId}/commands/set`;

    this.mqttService.publish(topic, {
      commandId,
      plantId: dto.plantId,
      stationId: dto.stationId,
      command: dto.command,
      value: dto.value,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Command [${commandId}] published: ${dto.command}=${dto.value} → ${topic}`);

    const timer = setTimeout(() => {
      if (this.pending.has(commandId)) {
        this.pending.delete(commandId);
        socket.emit('command:result', {
          commandId,
          status: 'TIMEOUT',
          message: 'No response from device within 10 seconds',
          timestamp: new Date().toISOString(),
        });
        this.logger.warn(`Command [${commandId}] timed out`);
      }
    }, 10_000);

    this.pending.set(commandId, { socket, timer });
    return commandId;
  }

  handleResponse(payload: CommandResultDto) {
    const { commandId } = payload;
    const pending = this.pending.get(commandId);

    if (!pending) {
      this.logger.warn(`Response for unknown commandId: ${commandId}`);
      return;
    }

    clearTimeout(pending.timer);
    this.pending.delete(commandId);

    pending.socket.emit('command:result', {
      commandId,
      status: payload.status,
      message: payload.message,
      timestamp: payload.timestamp ?? new Date().toISOString(),
    });

    this.logger.log(`Command [${commandId}] resolved with status: ${payload.status}`);
  }
}
