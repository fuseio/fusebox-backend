
import { Injectable, Logger } from '@nestjs/common'

import CentrifugoAPIService from '@app/common/services/centrifugo.service'

@Injectable()
export class SmartWalletsAAEventsService {
  private readonly logger = new Logger(SmartWalletsAAEventsService.name)

  constructor (
        private readonly centrifugoAPIService: CentrifugoAPIService
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
      this.centrifugoAPIService.publish(`walletAction:#${sender}`, messageData)
    } catch (error) {
      this.logger.error({ error })
      this.logger.error(`An error occurred during publish message to channel: walletAction:#${sender}`)
    }
  }
}
