import { Model, PaginateModel } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { userOpString, walletActionString } from './data-layer.constants'
import { BaseUserOp, UserOp } from '@app/smart-wallets-service/data-layer/interfaces/user-op.interface'
import { parsedUserOpToWalletAction } from 'apps/charge-smart-wallets-service/src/common/utils/wallet-action-factory'
import { WalletActionDocument } from '@app/smart-wallets-service/data-layer/schemas/wallet-action.schema'
import { UserOpFactory } from '../common/services/user-op-factory.service'
import { confirmedUserOpToWalletAction } from '@app/smart-wallets-service/common/utils/wallet-action-factory'
import { isNil } from 'lodash'
import { TokenService } from '../common/services/token.service'
import CentrifugoAPIService from '@app/common/services/centrifugo.service'

@Injectable()
export class DataLayerService {
  constructor(
    @Inject(userOpString)
    private userOpModel: Model<UserOp>,
    @Inject(walletActionString)
    private paginatedWalletActionModel: PaginateModel<WalletActionDocument>,
    private userOpFactory: UserOpFactory,
    private centrifugoAPIService: CentrifugoAPIService,
    private tokenService: TokenService
  ) { }

  async recordUserOp(baseUserOp: BaseUserOp) {
    const userOp = await this.userOpFactory.createUserOp(baseUserOp)
    const response = this.userOpModel.create(userOp)
    this.createWalletAction(userOp)
    return response
  }

  async updateUserOp(body: UserOp) {
    const existingUserOp = await this.userOpModel.findOne({ userOpHash: body.userOpHash })
    if (isNil(existingUserOp)) {
      return 'No record found with the provided userOpHash'
    }
    const updatedUserOp = await this.userOpModel.findOneAndUpdate({ userOpHash: body.userOpHash }, body, { new: true })
    this.centrifugoAPIService.publish(`userOp:#${updatedUserOp.sender}`, updatedUserOp)
    this.updateWalletAction(updatedUserOp)
    return updatedUserOp
  }

  async createWalletAction(parsedUserOp: any) {
    try {
      const walletAction = await parsedUserOpToWalletAction(parsedUserOp, this.tokenService)
      return this.paginatedWalletActionModel.create(walletAction)
    } catch (error) {
      console.log(error)
    }
  }

  async updateWalletAction(userOp: any) {
    const walletAction = confirmedUserOpToWalletAction(userOp)
    const updatedWalletAction = this.paginatedWalletActionModel.findOneAndUpdate({ userOpHash: walletAction.userOpHash }, walletAction, { new: true }) as any
    this.centrifugoAPIService.publish(`walletAction:#${updatedWalletAction.sender}`, updatedWalletAction)
    return updatedWalletAction
  }

  async getPaginatedWalletActions(pageNumber: number, walletAddress, limit, tokenAddress) {
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
