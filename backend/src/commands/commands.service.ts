import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MqttService } from '../mqtt/mqtt.service';
import { CommandRequestDto, CommandResultDto } from './dto/command.dto';
import { CommandRepository } from '../database/repositories/command.repository';

interface PendingCommand {
  socket: Socket;
  timer: NodeJS.Timeout;
  dto: CommandRequestDto;
}

@Injectable()
export class CommandsService implements OnModuleInit {
  private readonly logger = new Logger(CommandsService.name);
  private readonly pending = new Map<string, PendingCommand>();

  constructor(
    private readonly mqttService: MqttService,
    private readonly commandRepository: CommandRepository,
  ) {}

  onModuleInit() {
    this.mqttService.registerResponseHandler((_topic, payload) => {
      this.handleResponse(payload as CommandResultDto);
    });
  }

  executeCommand(dto: CommandRequestDto, socket: Socket): string {
    const commandId = crypto.randomUUID();
    const topic = `hvac/${dto.plantId}/${dto.stationId}/commands/set`;
    const timestamp = new Date();

    this.mqttService.publish(topic, {
      commandId,
      plantId: dto.plantId,
      stationId: dto.stationId,
      command: dto.command,
      value: dto.value,
      timestamp: timestamp.toISOString(),
    });

    this.logger.log(`Command [${commandId}] published: ${dto.command}=${dto.value} → ${topic}`);

    // Persist command record asynchronously
    this.commandRepository
      .saveCommand({
        commandId,
        plantId: dto.plantId,
        stationId: dto.stationId,
        command: dto.command,
        value: String(dto.value),
        status: 'pending',
        timestamp,
      })
      .catch((err: Error) => {
        this.logger.error(`Failed to persist command [${commandId}]: ${err.message}`);
      });

    const timer = setTimeout(() => {
      if (this.pending.has(commandId)) {
        this.pending.delete(commandId);
        socket.emit('command:result', {
          commandId,
          status: 'TIMEOUT',
          message: 'No response from device within 10 seconds',
          timestamp: new Date().toISOString(),
        });
        this.commandRepository
          .updateStatus(commandId, 'TIMEOUT', 'No response from device within 10 seconds')
          .catch((err: Error) => {
            this.logger.error(`Failed to update command status [${commandId}]: ${err.message}`);
          });
        this.logger.warn(`Command [${commandId}] timed out`);
      }
    }, 10_000);

    this.pending.set(commandId, { socket, timer, dto });
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

    // Update command status in DB
    this.commandRepository
      .updateStatus(commandId, payload.status, payload.message)
      .catch((err: Error) => {
        this.logger.error(`Failed to update command status [${commandId}]: ${err.message}`);
      });

    this.logger.log(`Command [${commandId}] resolved with status: ${payload.status}`);
  }
}
