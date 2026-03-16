import { Injectable, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MqttService } from '../mqtt/mqtt.service';
import { MachineDesignerService } from '../machine-designer/machine-designer.service';
import { CommandRequestDto, CommandResultDto } from './dto/command.dto';

interface PendingCommand {
  socket: Socket;
  timer: NodeJS.Timeout;
}

@Injectable()
export class CommandsService implements OnModuleInit {
  private readonly logger = new Logger(CommandsService.name);
  private readonly pending = new Map<string, PendingCommand>();

  constructor(
    private readonly mqttService: MqttService,
    @Inject(forwardRef(() => MachineDesignerService))
    private readonly designerService: MachineDesignerService,
  ) {}

  onModuleInit() {
    this.mqttService.registerResponseHandler((_topic, payload) => {
      this.handleResponse(payload as CommandResultDto);
    });
  }

  async executeCommand(dto: CommandRequestDto, socket: Socket): Promise<string> {
    const commandId = crypto.randomUUID();

    // Build topic dynamically based on machine type
    const topic = await this.buildCommandTopic(dto.machineType, dto.plantId, dto.stationId);

    this.mqttService.publish(topic, {
      commandId,
      machineType: dto.machineType,
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

  /**
   * Build the MQTT command topic for a given machine type.
   * Extracts the base from the mqttTopic pattern (e.g., "motor/#" → "motor").
   * Result: "{base}/{plantId}/{stationId}/commands/set"
   */
  private async buildCommandTopic(
    machineType: string,
    plantId: string,
    stationId: string,
  ): Promise<string> {
    try {
      const mt = await this.designerService.findBySlug(machineType);
      const topicBase = mt.mqttTopic.replace(/\/[#\+].*$/, '');
      return `${topicBase}/${plantId}/${stationId}/commands/set`;
    } catch {
      // Fallback: use machineType as topic base
      this.logger.warn(`Machine type "${machineType}" not found, using slug as topic base`);
      return `${machineType}/${plantId}/${stationId}/commands/set`;
    }
  }
}
