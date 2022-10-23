import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const UserId = createParamDecorator(
  (ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const userId = request.userId

    return userId
  }
)
