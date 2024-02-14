import { Inject, Injectable, Logger } from '@nestjs/common'

import CentrifugoAPIService from '@app/common/services/centrifugo.service'
import { accountsService } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'
@Injectable()
export class SmartWalletsAAEventsService {
  private readonly logger = new Logger(SmartWalletsAAEventsService.name)

  constructor (
    private readonly centrifugoAPIService: CentrifugoAPIService,
    @Inject(accountsService)
    private readonly accountClient: ClientProxy
  ) { }

  async publishUserOp (sender, messageData) {
    try {
      this.centrifugoAPIService.publish(`userOp:#${sender}`, messageData)
    } catch (error) {
      this.logger.error({ error })
      this.logger.error(`An error occurred during publish message to channel: userOp:#${sender}`)
    }
  }

  async publishWalletAction (sender, messageData) {
    try {
      // Attempt to call the microservice function
      try {
        if (messageData.name === 'tokenReceive') {
          callMSFunction(this.accountClient, 'handle-receive-walletAction', messageData)
        }
      } catch (error) {
        // Log the error and continue with the flow
        console.error(error)
      }
      // Continue with the original flow of the function
      this.centrifugoAPIService.publish(`walletAction:#${sender}`, messageData)
    } catch (error) {
      this.logger.error({ error })
      this.logger.error(`An error occurred during publish message to channel: walletAction:#${sender}`)
    }
  }
}
