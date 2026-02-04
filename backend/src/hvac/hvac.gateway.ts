/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TelemetryDto } from './dto/telemetry.dto';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class HvacGateway {
  @WebSocketServer()
  server: Server;

  sendTelemetry(data: TelemetryDto) {
    this.server.emit('telemetry', data);
  }
}
