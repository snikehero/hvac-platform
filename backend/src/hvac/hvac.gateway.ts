import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, forwardRef } from '@nestjs/common';
import { HvacService } from './hvac.service';
import { TelemetryDto } from './dto/telemetry.dto';
import type { DeviceEventDto } from '../common/dto/device-event.dto';

@WebSocketGateway({ cors: true })
export class HvacGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => HvacService))
    private readonly hvacService: HvacService,
  ) {}

  handleConnection(client: Socket) {
    client.emit('hvac_snapshot', this.hvacService.getSnapshot());
  }

  emitUpdate(payload: TelemetryDto) {
    this.server.emit('hvac_update', payload);
  }

  emitEvent(event: DeviceEventDto) {
    this.server.emit('device_event', event);
  }
}
