import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { CommandsService } from './commands.service';
import { CommandRequestDto } from './dto/command.dto';

@WebSocketGateway({ cors: true })
export class CommandsGateway {
  constructor(private readonly commandsService: CommandsService) {}

  @SubscribeMessage('command:execute')
  async handleCommandExecute(
    @MessageBody() dto: CommandRequestDto,
    @ConnectedSocket() client: Socket,
  ) {
    const commandId = await this.commandsService.executeCommand(dto, client);
    client.emit('command:acknowledged', {
      commandId,
      timestamp: new Date().toISOString(),
    });
  }
}
