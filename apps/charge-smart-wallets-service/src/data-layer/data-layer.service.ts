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
import { isNil } from 'lodash'
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
import FuseSdkService from '@app/common/services/fuse-sdk.service'

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
    private fuseSdkService: FuseSdkService
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
      this.smartWalletsAAEventsService.publishUserOp(response.sender, response)
      const walletAction = await this.createWalletActionFromUserOp(userOp)
      this.handleUserOpAndWalletAction({ userOp, walletAction })
      if (walletAction) {
        this.smartWalletsAAEventsService.publishWalletAction(walletAction.walletAddress, walletAction)
      }
      return response
    } catch (error) {
      throw new Error(error)
    }
  }

  async updateUserOp (body: UserOp) {
    try {
      const existingUserOp = await this.userOpModel.findOne({ userOpHash: body.userOpHash })
      if (isNil(existingUserOp)) {
        return 'No record found with the provided userOpHash'
      }
      const updatedUserOp = await this.userOpModel.findOneAndUpdate({ userOpHash: body.userOpHash }, body, { new: true })
      this.smartWalletsAAEventsService.publishUserOp(updatedUserOp.sender, updatedUserOp)
      this.updateWalletAction(updatedUserOp)
      return updatedUserOp
    } catch (error) {
      throw new Error(error)
    }
  }

  async createWalletActionFromUserOp (parsedUserOp: UserOp) {
    const walletAction = await parsedUserOpToWalletAction(parsedUserOp, this.tokenService)
    this.paginatedWalletActionModel.create(walletAction)
    return walletAction
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
      throw new Error(error)
    }
  }

  async handleTokenTransferWebhook (
    tokenTransferWebhookDto: TokenTransferWebhookDto
  ) {
    const from = tokenTransferWebhookDto.from
    const to = tokenTransferWebhookDto.to
    const txHash = tokenTransferWebhookDto.txHash
    const value = tokenTransferWebhookDto.value
    const tokenType = tokenTransferWebhookDto.tokenType
    const direction = tokenTransferWebhookDto.direction
    const address = tokenTransferWebhookDto.tokenAddress
    const name = tokenTransferWebhookDto.tokenName
    const symbol = tokenTransferWebhookDto.tokenSymbol
    const decimals = tokenTransferWebhookDto.tokenDecimals
    const blockNumber = tokenTransferWebhookDto.blockNumber
    const tokenId = tokenTransferWebhookDto.tokenId

    this.logger.debug('Handling token transfer webhook...')
    this.logger.debug(`TX hash: ${txHash}, direction: ${direction}`)

    const walletAction = tokenReceiveToWalletAction(
      from,
      to.toLowerCase(),
      txHash,
      value,
      tokenType,
      { name, symbol, address, decimals },
      blockNumber,
      tokenId
    )
    if (direction === 'incoming') {
      this.logger.debug('Creating a new receive wallet action...')
      this.smartWalletsAAEventsService.publishWalletAction(walletAction.walletAddress, walletAction)
      return this.paginatedWalletActionModel.create(walletAction)
    }

    this.logger.debug(
      'Not creating a new receive wallet action ' +
      'since the direction is not incoming...'
    )

    return true
  }

  async getPaginatedWalletActions (pageNumber: number, walletAddress, limit, tokenAddress) {
    let query
    if (tokenAddress) {
      query =
      {
        walletAddress,
        $or: [
          {
            sent: {
              $elemMatch: {
                address: tokenAddress
              }
            }
          },
          {
            received: {
              $elemMatch: {
                address: tokenAddress
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
      console.error('Error fetching paginated wallet actions:', error)
      throw error
    }
  }

  async findSponsoredTransactionsCount (sponsorId: string): Promise<number> {
    return this.userOpModel.countDocuments({ sponsorId: { $eq: sponsorId } })
  }

  async handleUserOpAndWalletAction (body) {
    try {
      const user = await this.getUserByApiKey(body.userOp.apiKey)
      if (body.walletAction.name === 'tokenTransfer') {
        const tokenPriceInUsd = await this.fuseSdkService.getPriceForTokenAddress(body.walletAction.sent[0].address)
        const amount = formatUnits(body.walletAction.sent[0].value, body.walletAction.sent[0].decimals)
        const amountUsd = Number(tokenPriceInUsd) * Number(amount)
        const event = {
          amount,
          amountUsd,
          token: body.walletAction.sent[0].symbol,
          apiKey: body.userOp.apiKey,
          email: user.email
        }
        try {
          this.analyticsService.trackEvent('Transaction (UserOp)', { ...event }, { user_id: user?.auth0Id })
        } catch (error) {
          console.error(error)
        }
      }
      return 'Transfer event processed'
    } catch (error) {
      throw new Error(error)
    }
  }

  async getUserByApiKey (apiKey) {
    try {
      const projectId = await callMSFunction(this.apiClient, 'get_project_id_by_public_key', apiKey)
      const project = await callMSFunction(this.accountsClient, 'find-one-project', projectId)
      const user = await callMSFunction(this.accountsClient, 'find-one-user', project.ownerId.toString())
      return user
    } catch (error) {
      console.error(error)
    }
  }
}
