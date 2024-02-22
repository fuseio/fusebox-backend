import { Inject, Injectable, Logger } from '@nestjs/common'
import CentrifugoAPIService from '@app/common/services/centrifugo.service'
import { accountsService } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
// import { callMSFunction } from '@app/common/utils/client-proxy'

@Injectable()
export class SmartWalletsAAEventsService {
  private readonly logger = new Logger(SmartWalletsAAEventsService.name)

  constructor (
    private readonly centrifugoAPIService: CentrifugoAPIService
    // @Inject(accountsService)
    // private readonly accountClient: ClientProxy
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
    if (messageData.name === 'tokenReceive') {
      // Todo: Do the handle-receive-walletAction call here instead of calling another module
      // try {
      //   callMSFunction(this.accountClient, 'handle-receive-walletAction', messageData).catch(e => {
      //     this.logger.log('Error in handle-receive-walletAction', e)
      //     this.logger.log(e)
      //   })
      // } catch (error) {
      //   this.logger.log(error)
      // }
    }

    try {
      this.centrifugoAPIService.publish(`walletAction:#${sender}`, messageData)
    } catch (error) {
      this.logger.error({ error })
      this.logger.error(`An error occurred during publish message to channel: walletAction:#${sender}`)
    }
  }
}
