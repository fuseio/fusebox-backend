import { UserOpParser } from '@app/common/services/user-op-parser.service'
import { UserOp } from '@app/smart-wallets-service/data-layer/interfaces/user-op.interface'
import { Injectable } from '@nestjs/common'

@Injectable()
export class UserOpFactory {
  constructor (
    private readonly userOpParser: UserOpParser
  ) { }

  async createUserOp (baseUserOp): Promise<UserOp> {
    const { targetFunctions, name } = await this.userOpParser.parseCallData(baseUserOp.callData)
    return {
      ...baseUserOp,
      walletFunction: { name },
      targetFunctions
    }
  }
}
