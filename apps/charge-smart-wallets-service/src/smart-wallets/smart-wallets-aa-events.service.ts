import { Inject, Injectable, Logger } from '@nestjs/common'
import { CentClient } from 'cent.js'
import { formatUnits } from 'nestjs-ethers'
import { AnalyticsService } from '@app/common/services/analytics.service'
import { ClientProxy } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'
import { accountsService } from '@app/common/constants/microservices.constants'
import TradeService from '@app/common/services/trade.service'

@Injectable()
export class SmartWalletsAAEventsService {
  private readonly logger = new Logger(SmartWalletsAAEventsService.name)

  constructor (
    private readonly centClient: CentClient,
    private analyticsService: AnalyticsService,
    private tradeService: TradeService,
    @Inject(accountsService) private readonly accountsClient: ClientProxy
  ) { }

  async publishUserOp (messageData: any) {
    const { userOpHash } = messageData.eventData
    try {
      this.logger.debug(`Publishing user op to channel: transaction:#${userOpHash}`)
      await this.centClient.publish({ channel: `transaction:#${userOpHash}`, data: messageData })
    } catch (error) {
      this.logger.error({ error })
      this.logger.error(`An error occurred during publish message to channel: transaction:#${userOpHash}`)
    }
  }

  async publishWalletAction (sender, messageData) {
    try {
      await this.centClient.publish({ channel: `walletAction:#${sender}`, data: messageData })
      if (messageData.name === 'tokenReceive') {
        this.handleReceiveWalletAction(messageData)
      }
    } catch (error) {
      this.logger.error({ error })
      this.logger.error(`An error occurred during publish message to channel: walletAction:#${sender}`)
    }
  }

  async subscribeUserOpHash (userOpHash: string, sender: string) {
    try {
      this.logger.debug(`Subscribing to channel transaction:#${userOpHash}`)
      await this.centClient.subscribe({ channel: `transaction:#${userOpHash}`, user: sender })
    } catch (error) {
      this.logger.error({ error })
      this.logger.error(`An error occurred during subscribe to channel transaction:#${userOpHash}`)
    }
  }

  async unsubscribeUserOpHash (userOpHash, sender) {
    try {
      this.logger.debug(`Unsubscribing from channel transaction:#${userOpHash}`)
      await this.centClient.unsubscribe({ channel: `transaction:#${userOpHash}`, user: sender })
    } catch (error) {
      this.logger.error({ error })
      this.logger.error(`An error occurred during unsubscribe from channel transaction:#${userOpHash}`)
    }
  }

  async handleReceiveWalletAction (walletAction) {
    try {
      const operator = await callMSFunction(this.accountsClient, 'find-operator-by-smart-wallet', walletAction.walletAddress)
      if (!operator) {
        return
      }
      const operatorId = operator.ownerId.toString()
      const user = await callMSFunction(this.accountsClient, 'find-one-user', operatorId)
      const projectId = (await callMSFunction(this.accountsClient, 'find-one-project-by-owner-id', operatorId))?._id.toString()
      const apiKey = (await callMSFunction(this.accountsClient, 'get-public', projectId))?.publicKey
      const tokenPriceInUsd = await this.tradeService.getTokenPrice(walletAction?.sent[0]?.address)
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
    } catch (error) {
      this.logger.error('Error tracking Account Balance Deposited:', error)
    }
  }
}
