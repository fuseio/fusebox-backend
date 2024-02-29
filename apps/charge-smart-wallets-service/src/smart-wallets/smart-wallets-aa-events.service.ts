import { Inject, Injectable, Logger } from '@nestjs/common'
import CentrifugoAPIService from '@app/common/services/centrifugo.service'
import { formatUnits } from 'nestjs-ethers'
import { AnalyticsService } from '@app/common/services/analytics.service'
import { ClientProxy } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'
import { accountsService } from '@app/common/constants/microservices.constants'
import FuseSdkService from '@app/common/services/fuse-sdk.service'

@Injectable()
export class SmartWalletsAAEventsService {
  private readonly logger = new Logger(SmartWalletsAAEventsService.name)

  constructor (
    private readonly centrifugoAPIService: CentrifugoAPIService,
    private analyticsService: AnalyticsService,
    private fuseSdkService: FuseSdkService,
    @Inject(accountsService) private readonly accountsClient: ClientProxy

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
      if (messageData.name === 'tokenReceive') {
        this.handleReceiveWalletAction(messageData)
      }
    } catch (error) {
      this.logger.error({ error })
      this.logger.error(`An error occurred during publish message to channel: walletAction:#${sender}`)
    }
  }

  async handleReceiveWalletAction (walletAction) {
    try {
      const operator = await callMSFunction(this.accountsClient, 'find-operator-by-smart-wallet', walletAction.walletAddress)
      if (!operator) {
        return 'Operator doesnt exist'
      }
      const operatorId = operator.ownerId.toString()
      const user = await callMSFunction(this.accountsClient, 'find-one-user', operatorId)
      const projectId = (await callMSFunction(this.accountsClient, 'find-one-project-by-owner-id', operatorId))?._id.toString()
      const apiKey = (await callMSFunction(this.accountsClient, 'get-public', projectId))?.publicKey
      const tokenPriceInUsd = await this.fuseSdkService.getPriceForTokenAddress(walletAction?.sent[0]?.address)
      const amount = formatUnits(walletAction?.sent[0]?.value, walletAction?.sent[0]?.decimals)
      const amountUsd = Number(tokenPriceInUsd) * Number(amount)
      const event = {
        amount,
        amountUsd,
        token: walletAction.sent[0].symbol,
        apiKey,
        email: user.email
      }
      this.analyticsService.trackEvent('Account Balance Deposited', { ...event }, { user_id: user?.auth0Id })
      return 'Receive event processed'
    } catch (error) {
      throw new Error(error)
    }
  }
}
