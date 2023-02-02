import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { SmartWalletsEventsService } from '@app/smart-wallets-service/smart-wallets/smart-wallets-events.service'
import { websocketMessages, websocketEvents } from '@app/smart-wallets-service/smart-wallets/constants/smart-wallets.constants'

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class SmartWalletsEventsGateway {
  // TODO: need to store in the DB
  subscribers: Map<string, Socket> = new Map<string, Socket>()
  constructor (private readonly smartWalletsEventsService: SmartWalletsEventsService) {}

  @WebSocketServer()
    server: Server

  @SubscribeMessage(websocketMessages.JOB_STARTED)
  handleStartedJob (@MessageBody() queueJob: Record<string, any>): void {
    const { name, data: { transactionId } } = queueJob
    const client = this.subscribers.get(transactionId)
    if (name === 'createWallet') {
      this.smartWalletsEventsService.onCreateSmartWalletStarted(queueJob)
      client?.emit(websocketEvents.WALLET_CREATION_STARTED, queueJob)
    } else if (name === 'relay') {
      client?.emit(websocketEvents.TRANSACTION_STARTED, queueJob)
    }
  }

  @SubscribeMessage(websocketMessages.JOB_SUCCEEDED)
  async handleSuccessJob (@MessageBody() queueJob: Record<string, any>): Promise<void> {
    const { name, data: { transactionId } } = queueJob
    const client = this.subscribers.get(transactionId)
    if (name === 'createWallet') {
      const data = await this.smartWalletsEventsService.onCreateSmartWalletSuccess(queueJob)
      client?.emit(websocketEvents.WALLET_CREATION_SUCCEEDED, data)
    } else if (name === 'relay') {
      client?.emit(websocketEvents.TRANSACTION_SUCCEEDED, queueJob)
    }
    this.subscribers.delete(transactionId)
  }

  @SubscribeMessage(websocketMessages.JOB_FAILED)
  handleFailedJob (@MessageBody() queueJob: Record<string, any>): void {
    const { name, data: { transactionId } } = queueJob
    const client = this.subscribers.get(transactionId)
    if (name === 'createWallet') {
      client?.emit(websocketEvents.WALLET_CREATION_FAILED, queueJob)
    } else if (name === 'relay') {
      client?.emit(websocketEvents.TRANSACTION_FAILED, queueJob)
    }
    this.subscribers.delete(transactionId)
  }

  @SubscribeMessage(websocketMessages.SUBSCRIBE)
  subscribe (@MessageBody() transactionId: string, @ConnectedSocket() client: Socket): void {
    this.subscribers.set(transactionId, client)
  }
}
