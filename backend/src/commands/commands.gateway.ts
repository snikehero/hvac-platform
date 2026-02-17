import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { CommandsService } from './commands.service';
import { CommandRequestDto } from './dto/command.dto';

@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGIN || '*' },
})
export class CommandsGateway {
  constructor(private readonly commandsService: CommandsService) {}

  @SubscribeMessage('command:execute')
  handleCommandExecute(
    @MessageBody() dto: CommandRequestDto,
    @ConnectedSocket() client: Socket,
  ) {
    const commandId = this.commandsService.executeCommand(dto, client);
    client.emit('command:acknowledged', {
      commandId,
      timestamp: new Date().toISOString(),
    });
  }
}
