import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { userOpString, walletActionString } from './data-layer.constants'
import { BaseUserOp, UserOp } from './interfaces/user-op.interface';
import { UserOpFactory } from '@app/smart-wallets-service/common/utils/user-op-parser'
import { parsedUserOpToWalletAction } from 'apps/charge-smart-wallets-service/src/common/utils/helper-functions'
import { WalletActionDocument } from '@app/smart-wallets-service/data-layer/schemas/wallet-action.schema'
import { PaginateModel } from 'mongoose'

@Injectable()
export class DataLayerService {

  constructor (
    @Inject(userOpString)
    private userOpModel: Model<UserOp>,
    @Inject(walletActionString)
    private userOpFactory: UserOpFactory,
    private paginatedWalletActionModel: PaginateModel<WalletActionDocument>
  ) { }

  async recordUserOp (baseUserOp: BaseUserOp) {
    const userOp = this.userOpFactory.createUserOp(baseUserOp)
    const response = this.userOpModel.create(userOp)
    this.createWalletAction(userOp)
    return response
  }

  async updateUserOp (body: UserOp) {
    return this.userOpModel.findOneAndUpdate({ userOpHash: body.userOpHash }, { ...body }, { upsert: true })
  }

  async createWalletAction (parsedUserOp: any) {
    const walletAction = await parsedUserOpToWalletAction(parsedUserOp)
    return this.paginatedWalletActionModel.create(walletAction)
  }

  async getPaginatedWalletActions (pageNumber: number, walletAddress) {
    try {
      const query =
      {
        walletAddress
      }
      const options = {
        page: pageNumber,
        limit: 20,
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
