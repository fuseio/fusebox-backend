import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { ISmartWalletUser } from '@app/common/interfaces/smart-wallet.interface'

export const SmartWalletOwner = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()

    return request.user as ISmartWalletUser
  }
)
