import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { SmartAccountsEventsService } from '@app/smart-accounts-service/smart-accounts/smart-accounts-events.service'

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class SmartAccountEventsGateway {
  constructor (private readonly smartAccountsEventsService: SmartAccountsEventsService) {}

  @WebSocketServer()
    server: Server

  @SubscribeMessage('relayer')
  handleRelayMessage (@MessageBody() txUpdate: Record<string, string>): void {
    console.log(txUpdate)
    const txHash = txUpdate.txHash
    const txStatus = txUpdate.status
    this.server.emit(txHash, txStatus)
  }

  @SubscribeMessage('onJobStarted')
  handleStartedJob (@MessageBody() queueJob: Record<string, any>): void {
    const { _id } = queueJob
    this.server.emit(_id, queueJob)
  }

  @SubscribeMessage('onJobSuccess')
  handleSuccessJob (@MessageBody() queueJob: Record<string, any>): void {
    // TODO: review client to understand better their needs
    const { name, _id } = queueJob
    if (name === 'createWallet') {
      this.smartAccountsEventsService.onCreateSmartWallet(queueJob)
    } else if (name === 'relay') {
      this.smartAccountsEventsService.onRelay(queueJob)
    }
    this.server.emit(_id, queueJob)
  }

  @SubscribeMessage('onJobFailed')
  handleFailedJob (@MessageBody() queueJob: Record<string, any>): void {
    const { _id } = queueJob
    this.server.emit(_id, queueJob)
  }
}
