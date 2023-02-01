import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { SmartAccountsEventsService } from '@app/smart-accounts-service/smart-accounts/smart-accounts-events.service'
import { websocketMessages, websocketEvents } from '@app/smart-accounts-service/smart-accounts/constants/smart-accounts.constants'

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class SmartAccountEventsGateway {
  // TODO: need to store in the DB
  subscribers: Map<string, Socket> = new Map<string, Socket>()
  constructor (private readonly smartAccountsEventsService: SmartAccountsEventsService) {}

  @WebSocketServer()
    server: Server

  @SubscribeMessage(websocketMessages.JOB_STARTED)
  handleStartedJob (@MessageBody() queueJob: Record<string, any>): void {
    // TODO: create a custom event for create wallet
    const { name, data: { transactionId } } = queueJob
    const client = this.subscribers.get(transactionId)
    if (name === 'createWallet') {
      this.smartAccountsEventsService.onCreateSmartAccountStarted(queueJob)
      client.emit(websocketEvents.ACCOUNT_CREATION_STARTED, queueJob)
    } else if (name === 'relay') {
      client.emit(websocketEvents.TRANSACTION_STARTED, queueJob)
    }
  }

  @SubscribeMessage(websocketMessages.JOB_SUCCEEDED)
  async handleSuccessJob (@MessageBody() queueJob: Record<string, any>): Promise<void> {
    const { name, data: { transactionId } } = queueJob
    const client = this.subscribers.get(transactionId)
    if (name === 'createWallet') {
      const data = await this.smartAccountsEventsService.onCreateSmartAccountSuccess(queueJob)
      client.emit(websocketEvents.ACCOUNT_CREATION_SUCCEEDED, data)
    } else if (name === 'relay') {
      client.emit(websocketEvents.TRANSACTION_SUCCEEDED, queueJob)
    }
    this.subscribers.delete(transactionId)
  }

  @SubscribeMessage(websocketMessages.JOB_FAILED)
  handleFailedJob (@MessageBody() queueJob: Record<string, any>): void {
    const { name, data: { transactionId } } = queueJob
    const client = this.subscribers.get(transactionId)
    if (name === 'createWallet') {
      client.emit(websocketEvents.ACCOUNT_CREATION_FAILED, queueJob)
    } else if (name === 'relay') {
      client.emit(websocketEvents.TRANSACTION_FAILED, queueJob)
    }
    this.subscribers.delete(transactionId)
  }

  @SubscribeMessage(websocketMessages.SUBSCRIBE)
  subscribe (@MessageBody() transactionId: string, @ConnectedSocket() client: Socket): void {
    this.subscribers.set(transactionId, client)
  }
}
