import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
// import { ConfigService } from '@nestjs/config'
import { userOpString } from './data-layer.constants'
import { UserOp } from './interfaces/user-op.interface'
// import { IUserOperation } from 'userop'

@Injectable()
export class DataLayerService {
  constructor (
    @Inject(userOpString)
    private userOpModel: Model<UserOp>
  ) { }

  async create (body: UserOp) {
    return this.userOpModel.create(body)
  }

  async update (body: UserOp) {
    return this.userOpModel.findOneAndUpdate({ userOpHash: body.userOpHash }, { ...body }, { upsert: true, new: true })
  }
}
