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
import { SmartWalletsEventsService } from '../smart-wallets/smart-wallets-events.service'

@Injectable()
export class DataLayerService {
  private readonly logger = new Logger(DataLayerService.name)

  constructor (
    @Inject(userOpString)
    private userOpModel: Model<UserOp>,
    @Inject(walletActionString)
    private paginatedWalletActionModel: PaginateModel<WalletActionDocument>,
    private userOpFactory: UserOpFactory,
    private tokenService: TokenService,
    private smartWalletsEventsService: SmartWalletsEventsService
  ) { }

  async recordUserOp (baseUserOp: BaseUserOp) {
    const userOp = await this.userOpFactory.createUserOp(baseUserOp)
    const response = this.userOpModel.create(userOp)
    this.createWalletActionFromUserOp(userOp)
    return response
  }

  async updateUserOp (body: UserOp) {
    const existingUserOp = await this.userOpModel.findOne({ userOpHash: body.userOpHash })
    if (isNil(existingUserOp)) {
      return 'No record found with the provided userOpHash'
    }
    const updatedUserOp = await this.userOpModel.findOneAndUpdate({ userOpHash: body.userOpHash }, body, { new: true })
    this.smartWalletsEventsService.publishUserOp(updatedUserOp.sender, updatedUserOp)
    this.updateWalletAction(updatedUserOp)
    return updatedUserOp
  }

  async createWalletActionFromUserOp (parsedUserOp: UserOp) {
    try {
      const walletAction = await parsedUserOpToWalletAction(parsedUserOp, this.tokenService)
      this.smartWalletsEventsService.publishWalletAction(walletAction.walletAddress, walletAction)
      return this.paginatedWalletActionModel.create(walletAction)
    } catch (error) {
      console.log(error)
    }
  }

  async updateWalletAction (userOp: any) {
    const walletAction = confirmedUserOpToWalletAction(userOp)
    const updatedWalletAction = await this.paginatedWalletActionModel.findOneAndUpdate({ userOpHash: walletAction.userOpHash }, walletAction, { new: true }).lean() as any
    this.smartWalletsEventsService.publishWalletAction(updatedWalletAction.walletAddress, updatedWalletAction)
    return updatedWalletAction
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
      this.smartWalletsEventsService.publishWalletAction(walletAction.walletAddress, walletAction)
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
}
