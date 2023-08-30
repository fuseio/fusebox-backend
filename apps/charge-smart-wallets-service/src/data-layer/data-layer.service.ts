import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { userOpString, walletActionString } from './data-layer.constants'
import { UserOp } from './interfaces/user-op.interface'
import { WalletAction } from './interfaces/wallet-action.interface'
import { UserOpParser } from '@app/common/utils/user-op-parser'
import { parsedUserOpToWalletAction } from 'apps/charge-smart-wallets-service/src/common/utils/helper-functions'

@Injectable()
export class DataLayerService {
  constructor(
    @Inject(userOpString)
    private userOpModel: Model<UserOp>,
    @Inject(walletActionString)
    private walletActionModel: Model<WalletAction>,
    private userOpParser: UserOpParser
  ) { }

  async recordUserOp(body: UserOp) {
    const decodedCallData = await this.userOpParser.parseCallData(body.callData)
    // body.callData = decodedCallData
    body.walletFunction = {
      name: decodedCallData.walletFunction[0].walletFunction,
      arguments: decodedCallData.walletFunction[0].arguments
    }
    body.targetFunction = decodedCallData.targetFunction
    console.log(await this.createWalletAction(body));
    return this.userOpModel.create(body)
  }

  async updateUserOp(body: UserOp) {
    return this.userOpModel.findOneAndUpdate({ userOpHash: body.userOpHash }, { ...body }, { upsert: true })
  }
  async createWalletAction(parsedUserOp: any) {
    const walletAction = parsedUserOpToWalletAction(parsedUserOp)
    console.log(walletAction);
    return this.walletActionModel.create(walletAction)
  }


}
