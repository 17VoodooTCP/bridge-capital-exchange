import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SupportService } from './support.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/support' })
export class SupportGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly support: SupportService) {}

  handleConnection(client: Socket) {
    console.log(`Support client connected: ${client.id}`);
  }
  handleDisconnect(client: Socket) {
    console.log(`Support client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  onJoin(@MessageBody() ticketId: string, @ConnectedSocket() client: Socket) {
    client.join(`ticket:${ticketId}`);
    return { joined: ticketId };
  }

  @SubscribeMessage('message')
  async onMessage(@MessageBody() data: { ticketId: string; senderId: string; content: string; fileUrl?: string }) {
    const msg = await this.support.sendMessage(data.ticketId, data.senderId, { content: data.content, fileUrl: data.fileUrl });
    this.server.to(`ticket:${data.ticketId}`).emit('message', msg);
    return msg;
  }

  @SubscribeMessage('typing')
  onTyping(@MessageBody() data: { ticketId: string; user: string }, @ConnectedSocket() client: Socket) {
    client.to(`ticket:${data.ticketId}`).emit('typing', data.user);
  }
}
