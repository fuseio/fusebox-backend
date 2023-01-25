import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { ISmartAccountUser } from '@app/common/interfaces/smart-account.interface'

export const SmartAccountOwner = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()

    return request.user as ISmartAccountUser
  }
)
