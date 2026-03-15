import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { GenericTelemetryDto } from './dto/generic-telemetry.dto';

export interface MachineUpdatePayload extends GenericTelemetryDto {
  machineType: string;
}

@WebSocketGateway({ cors: true })
export class MachineGateway {
  private readonly logger = new Logger(MachineGateway.name);

  @WebSocketServer()
  server: Server;

  private snapshotProvider: (() => Record<string, GenericTelemetryDto[]>) | null =
    null;

  /** Called by MachineService to register its snapshot provider */
  setSnapshotProvider(fn: () => Record<string, GenericTelemetryDto[]>) {
    this.snapshotProvider = fn;
  }

  handleConnection(client: Socket) {
    if (this.snapshotProvider) {
      const snapshot = this.snapshotProvider();
      client.emit('machine_snapshot', snapshot);
      this.logger.debug(`Sent machine_snapshot to client ${client.id}`);
    }
  }

  emitUpdate(machineType: string, payload: GenericTelemetryDto) {
    const data: MachineUpdatePayload = { machineType, ...payload };
    this.server.emit('machine_update', data);
  }

  emitEvent(event: any) {
    this.server.emit('machine_event', event);
  }
}
