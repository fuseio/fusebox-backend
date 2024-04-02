import { Model, PaginateModel } from 'mongoose'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { userOpString, walletActionString } from '@app/smart-wallets-service/data-layer/data-layer.constants'
import { BaseUserOp, UserOp } from '@app/smart-wallets-service/data-layer/interfaces/user-op.interface'
import { WalletActionDocument } from '@app/smart-wallets-service/data-layer/schemas/wallet-action.schema'
import { UserOpFactory } from '@app/smart-wallets-service/common/services/user-op-factory.service'
import {
  confirmedUserOpToWalletAction,
  tokenReceiveToWalletAction,
  parsedUserOpToWalletAction
} from '@app/smart-wallets-service/common/utils/wallet-action-factory'
import { get, has, isNil } from 'lodash'
import { TokenService } from '@app/smart-wallets-service/common/services/token.service'
import { TokenTransferWebhookDto } from '@app/smart-wallets-service/smart-wallets/dto/token-transfer-webhook.dto'
import { SmartWalletsAAEventsService } from '@app/smart-wallets-service/smart-wallets/smart-wallets-aa-events.service'
import { WalletActionInterface } from '@app/smart-wallets-service/data-layer/interfaces/wallet-action.interface'
import { decodePaymasterAndData } from '@app/smart-wallets-service/common/utils/helper-functions'
import { AnalyticsService } from '@app/common/services/analytics.service'
import { formatUnits } from 'nestjs-ethers'
import { accountsService, apiService } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'
import TradeService from '@app/common/services/trade.service'
import { websocketEvents } from '@app/smart-wallets-service/smart-wallets/constants/smart-wallets.constants'
import { utils } from 'web3'
@Injectable()
export class DataLayerService {
  private readonly logger = new Logger(DataLayerService.name)

  constructor (
    @Inject(userOpString)
    private userOpModel: Model<UserOp>,
    @Inject(walletActionString)
    private paginatedWalletActionModel: PaginateModel<WalletActionDocument>,
    @Inject(apiService) private readonly apiClient: ClientProxy,
    @Inject(accountsService) private readonly accountsClient: ClientProxy,
    private userOpFactory: UserOpFactory,
    private tokenService: TokenService,
    private smartWalletsAAEventsService: SmartWalletsAAEventsService,
    private analyticsService: AnalyticsService,
    private tradeService: TradeService
  ) { }

  async recordUserOp (baseUserOp: BaseUserOp) {
    try {
      if (baseUserOp.paymasterAndData !== '0x') {
        const paymasterAddressAndSponsorId = decodePaymasterAndData(baseUserOp.paymasterAndData)
        baseUserOp.paymaster = paymasterAddressAndSponsorId.paymasterAddress
        baseUserOp.sponsorId = paymasterAddressAndSponsorId.sponsorId
      }
      const userOp = await this.userOpFactory.createUserOp(baseUserOp)
      const response = await this.userOpModel.create(userOp) as UserOp
      await this.smartWalletsAAEventsService.subscribeUserOpHash(response.userOpHash, response.sender)
      await this.smartWalletsAAEventsService.publishUserOp({
        eventName: websocketEvents.TRANSACTION_STARTED,
        eventData: {
          userOpHash: response.userOpHash,
          sender: response.sender
        }
      })
      const walletAction = await this.createWalletActionFromUserOp(userOp)
      this.handleUserOpAndWalletActionOfOperatorToSendAnalyticsEvent({ userOp, walletAction })
      if (walletAction) {
        this.smartWalletsAAEventsService.publishWalletAction(walletAction.walletAddress, walletAction)
      }

      return response
    } catch (error) {
      this.logger.error('Error recording user op:', error)
    }
  }

  async updateUserOp (body: UserOp) {
    try {
      const existingUserOp = await this.userOpModel.findOne({ userOpHash: body.userOpHash })
      if (isNil(existingUserOp)) {
        return 'No record found with the provided userOpHash'
      }
      const updatedUserOp = await this.userOpModel.findOneAndUpdate({ userOpHash: body.userOpHash }, body, { new: true })
      const eventData = {
        userOpHash: updatedUserOp.userOpHash,
        sender: updatedUserOp.sender,
        txHash: updatedUserOp.txHash
      }
      if (updatedUserOp.success) {
        await this.smartWalletsAAEventsService.publishUserOp({
          eventName: websocketEvents.TRANSACTION_SUCCEEDED,
          eventData
        })
      } else {
        await this.smartWalletsAAEventsService.publishUserOp({
          eventName: websocketEvents.TRANSACTION_FAILED,
          eventData
        })
      }
      await this.smartWalletsAAEventsService.unsubscribeUserOpHash(updatedUserOp.userOpHash, updatedUserOp.sender)
      this.updateWalletAction(updatedUserOp)

      return updatedUserOp
    } catch (error) {
      this.logger.error('Error updating user op:', error)
    }
  }

  async createWalletActionFromUserOp (parsedUserOp: UserOp) {
    try {
      const walletAction = await parsedUserOpToWalletAction(parsedUserOp, this.tokenService)
      await this.paginatedWalletActionModel.create(walletAction)
      return walletAction
    } catch (error) {
      throw new Error(`Failed to create wallet action from user operation: ${error.message}`)
    }
  }

  async updateWalletAction (userOp: any) {
    try {
      const walletAction = confirmedUserOpToWalletAction(userOp)
      const updatedWalletAction = await this.paginatedWalletActionModel.findOneAndUpdate({ userOpHash: walletAction.userOpHash }, walletAction, { new: true }).lean() as WalletActionInterface
      if (updatedWalletAction) {
        this.smartWalletsAAEventsService.publishWalletAction(updatedWalletAction.walletAddress, updatedWalletAction)
      }
      return updatedWalletAction
    } catch (error) {
      this.logger.error('Error updating wallet action:', error)
    }
  }

  async handleTokenTransferWebhook (
    tokenTransferWebhookDto: TokenTransferWebhookDto
  ) {
    try {
      const {
        direction
      } = tokenTransferWebhookDto

      if (direction === 'incoming') {
        this.logger.debug('Handling token transfer webhook...')
        const {
          from,
          to,
          txHash,
          value,
          tokenType,
          tokenAddress,
          tokenName,
          tokenSymbol,
          tokenDecimals,
          blockNumber,
          tokenId
        } = tokenTransferWebhookDto
        this.logger.debug(`TX hash: ${txHash}, direction: ${direction}`)

        const tokenDetails = {
          name: tokenName,
          symbol: tokenSymbol,
          address: tokenAddress,
          decimals: tokenDecimals
        }

        const walletAction = tokenReceiveToWalletAction(
          from,
          to.toLowerCase(),
          txHash,
          value,
          tokenType,
          tokenDetails,
          blockNumber,
          tokenId
        )

        this.logger.debug('Creating a new receive wallet action...')
        this.smartWalletsAAEventsService.publishWalletAction(walletAction.walletAddress, walletAction)
        return this.paginatedWalletActionModel.create(walletAction)
      }

      this.logger.debug(
        'Not creating a new receive wallet action ' +
        'since the direction is not incoming...'
      )

      return true
    } catch (error) {
      this.logger.error('Error handling token transfer webhook:', error)
      throw error
    }
  }

  async getPaginatedWalletActions (pageNumber: number, walletAddress, limit, tokenAddress) {
    let query
    if (tokenAddress) {
      const tokenAddressLower = tokenAddress.toLowerCase()
      const tokenAddressChecksum = utils.toChecksumAddress(tokenAddress)
      query = {
        walletAddress,
        $or: [
          {
            sent: {
              $elemMatch: {
                $or: [
                  { address: tokenAddress },
                  { address: tokenAddressChecksum },
                  { lowercasedAddress: tokenAddressLower }
                ]
              }
            }
          },
          {
            received: {
              $elemMatch: {
                $or: [
                  { address: tokenAddress },
                  { address: tokenAddressChecksum },
                  { lowercasedAddress: tokenAddressLower }
                ]
              }
            }
          }
        ]
      }
    } else {
      query =
      {
        walletAddress
      }
    }
    try {
      const options = {
        page: pageNumber || 1,
        limit: limit || 20,
        sort: { updatedAt: -1 }
      }

      const result = await this.paginatedWalletActionModel.paginate(query, options)

      return result
    } catch (error) {
      this.logger.error('Error fetching paginated wallet actions:', error)
      throw error
    }
  }

  async findSponsoredTransactionsCount (sponsorId: string): Promise<number> {
    return this.userOpModel.countDocuments({ sponsorId: { $eq: sponsorId } })
  }

  async handleUserOpAndWalletActionOfOperatorToSendAnalyticsEvent (body) {
    try {
      const user = await this.getOperatorByApiKey(body.userOp.apiKey)
      if (!get(user, 'auth0Id')) {
        return
      }
      if (get(body, 'walletAction.name') === 'tokenTransfer') {
        const [sent] = get(body, 'walletAction.sent', [])
        if (has(sent, 'address') && has(sent, 'value') && has(sent, 'decimals')) {
          const { address, value, decimals } = sent
          const tokenPriceInUsd = await this.tradeService.getTokenPrice(address)
          const amount = formatUnits(value, decimals)
          const amountUsd = Number(tokenPriceInUsd) * Number(amount)
          const event = {
            amount,
            amountUsd,
            token: body?.walletAction.sent[0].symbol,
            apiKey: body?.userOp?.apiKey,
            email: user?.email ? user.email : 'empty email'
          }
          try {
            this.analyticsService.trackEvent('Transaction (UserOp)', { ...event }, { user_id: user.auth0Id })
          } catch (error) {
            this.logger.error('Error tracking event:', error)
          }
        }
      }
    } catch (error) {
      this.logger.error('Error handling user op and wallet action for operators analytics event:', error)
    }
  }

  async getOperatorByApiKey (apiKey) {
    try {
      const projectId = await callMSFunction(this.apiClient, 'get_project_id_by_public_key', apiKey)
      const project = await callMSFunction(this.accountsClient, 'find-one-project', projectId)
      const user = await callMSFunction(this.accountsClient, 'find-one-user', project.ownerId.toString())
      const operator = await callMSFunction(this.accountsClient, 'find-operator-by-owner-id', user._id)
      if (!operator) {
        this.logger.log('Operator didnt exists')
        return false
      }
      return user
    } catch (error) {
      this.logger.error(error)
    }
  }
}
