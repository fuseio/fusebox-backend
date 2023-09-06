import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { userOpString, walletActionString } from './data-layer.constants'
import { UserOp } from './interfaces/user-op.interface'
import { UserOpParser } from '@app/common/utils/user-op-parser'
import { parsedUserOpToWalletAction } from 'apps/charge-smart-wallets-service/src/common/utils/helper-functions'
import { WalletActionDocument } from '@app/smart-wallets-service/data-layer/schemas/wallet-action.schema'
import * as mongoose from 'mongoose'


@Injectable()
export class DataLayerService {
  constructor(
    @Inject(userOpString)
    private userOpModel: Model<UserOp>,
    private userOpParser: UserOpParser,
    @Inject(walletActionString)
    private paginatedWalletActionModel: mongoose.PaginateModel<WalletActionDocument>

  ) { }

  async recordUserOp(body: UserOp) {
    const decodedCallData = await this.userOpParser.parseCallData(body.callData)
    body.walletFunction = {
      name: decodedCallData.walletFunction[0].walletFunction,
      arguments: decodedCallData.walletFunction[0].arguments
    }
    body.targetFunction = decodedCallData.targetFunction
    await this.createWalletAction(body)
    return this.userOpModel.create(body)
  }

  async updateUserOp(body: UserOp) {
    return this.userOpModel.findOneAndUpdate({ userOpHash: body.userOpHash }, { ...body }, { upsert: true })
  }
  async createWalletAction(parsedUserOp: any) {
    const walletAction = await parsedUserOpToWalletAction(parsedUserOp)
    return this.paginatedWalletActionModel.create(walletAction)
  }
  async getPaginatedWalletActions(pageNumber: number, walletAddress) {
    try {
      const query =
      {
        walletAddress: walletAddress
      }
      const options = {
        page: pageNumber,
        limit: 20,
        sort: { updatedAt: -1 }
      };
      const result = await this.paginatedWalletActionModel.paginate(query, options);
      return result;
    } catch (error) {
      console.error('Error fetching paginated wallet actions:', error);
      throw error;
    }
  }


}
