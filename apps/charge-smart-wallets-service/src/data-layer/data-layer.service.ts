import { Model, PaginateModel } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { userOpString, walletActionString } from './data-layer.constants'
import { BaseUserOp, UserOp } from '@app/smart-wallets-service/data-layer/interfaces/user-op.interface'
import { UserOpFactory } from '@app/smart-wallets-service/common/utils/user-op-parser'
import { parsedUserOpToWalletAction } from 'apps/charge-smart-wallets-service/src/common/utils/wallet-action-factory'
import { WalletActionDocument } from '@app/smart-wallets-service/data-layer/schemas/wallet-action.schema'

@Injectable()
export class DataLayerService {
  constructor (
    @Inject(userOpString)
    private userOpModel: Model<UserOp>,
    @Inject(walletActionString)
    private paginatedWalletActionModel: PaginateModel<WalletActionDocument>,
    private userOpFactory: UserOpFactory
  ) { }

  async recordUserOp (baseUserOp: BaseUserOp) {
    const userOp = await this.userOpFactory.createUserOp(baseUserOp)
    const response = this.userOpModel.create(userOp)
    this.createWalletAction(userOp)
    return response
  }

  async updateUserOp (body: UserOp) {
    return this.userOpModel.findOneAndUpdate({ userOpHash: body.userOpHash }, { ...body }, { upsert: true })
  }

  async createWalletAction (parsedUserOp: any) {
    try {
      const walletAction = await parsedUserOpToWalletAction(parsedUserOp)
      return this.paginatedWalletActionModel.create(walletAction)
    } catch (error) {
      console.log(error)
    }
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
