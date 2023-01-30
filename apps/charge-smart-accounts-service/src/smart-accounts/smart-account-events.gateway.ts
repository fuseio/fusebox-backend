import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { SmartAccountsEventsService } from '@app/smart-accounts-service/smart-accounts/smart-accounts-events.service'

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

  @SubscribeMessage('jobStarted')
  handleStartedJob (@MessageBody() queueJob: Record<string, any>): void {
    const { name, data: { transactionId } } = queueJob
    if (name === 'createWallet') {
      this.smartAccountsEventsService.onCreateSmartAccountStarted(queueJob)
    }
    const client = this.subscribers.get(transactionId)
    client.emit('transactionStarted', queueJob)
  }

  @SubscribeMessage('jobSuccess')
  handleSuccessJob (@MessageBody() queueJob: Record<string, any>): void {
    const { name, data: { transactionId } } = queueJob
    let jobResponse
    if (name === 'createWallet') {
      jobResponse = this.smartAccountsEventsService.onCreateSmartAccountSuccess(queueJob)
    } else if (name === 'relay') {
      jobResponse = this.smartAccountsEventsService.onRelaySuccess(queueJob) ?? queueJob
    }
    const client = this.subscribers.get(transactionId)
    client.emit('transactionSuccess', jobResponse)
    this.subscribers.delete(transactionId)
  }

  @SubscribeMessage('jobFailed')
  handleFailedJob (@MessageBody() queueJob: Record<string, any>): void {
    const { data: { transactionId } } = queueJob
    const client = this.subscribers.get(transactionId)
    client.emit('transactionFailed', queueJob)
    this.subscribers.delete(transactionId)
  }

  @SubscribeMessage('subscribe')
  subscribe (@MessageBody() transactionId: string, @ConnectedSocket() client: Socket): void {
    this.subscribers.set(transactionId, client)
  }
}
