import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class SmartAccountEventsGateway {
  @WebSocketServer()
    server: Server
        
  @SubscribeMessage('relayer')
  handleRelayMessage(@MessageBody() txUpdate: Record<string, string>): void {
    console.log(txUpdate)
    const txHash = txUpdate.txHash
    const txStatus = txUpdate.status
    this.server.emit(txHash, txStatus)
  }

}
