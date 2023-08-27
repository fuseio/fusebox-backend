import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
// import { ConfigService } from '@nestjs/config'
import { userOpString } from './data-layer.constants'
import { UserOp } from './interfaces/user-op.interface'
// import { IUserOperation } from 'userop'
import { UserOpParser } from '@app/common/utils/user-op-parser'
import { decodeCalldata } from '@app/common/utils/user-op-parser'
@Injectable()
export class DataLayerService {
  constructor (
    @Inject(userOpString)
    private userOpModel: Model<UserOp>,
    private userOpParser: UserOpParser
  ) { }

  async recordUserOp (body: any) {
    const decodedCallData = await this.userOpParser.parseCallData(body.callData)
    body.callData = decodedCallData
    return this.userOpModel.create(body)
  }

  async updateUserOp (body: UserOp) {
    return this.userOpModel.findOneAndUpdate({ userOpHash: body.userOpHash }, { ...body }, { upsert: true })
  }
}
