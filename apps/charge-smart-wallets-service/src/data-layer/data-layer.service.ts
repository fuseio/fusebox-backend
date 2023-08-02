import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
// import { ConfigService } from '@nestjs/config'
import { userOpString } from './data-layer.constants'
import { UserOp } from './interfaces/user-op.interface'
// import { IUserOperation } from 'userop'
import { UserOpParser } from '@app/common/utils/userOpParser'
import { decodeCalldata } from '@app/common/utils/userOpParser'
@Injectable()
export class DataLayerService {
  constructor(
    @Inject(userOpString)
    private userOpModel: Model<UserOp>,
    private userOpParser: UserOpParser
  ) { }

  async create(body: UserOp) {
    console.log(body.callData);
    const decodedCallData = await this.userOpParser.parseCallData(body.callData)
    console.log(decodedCallData);

    return this.userOpModel.create(body)
  }

  async update(body: UserOp) {
    return this.userOpModel.findOneAndUpdate({ userOpHash: body.userOpHash }, { ...body }, { upsert: true })
  }
}
