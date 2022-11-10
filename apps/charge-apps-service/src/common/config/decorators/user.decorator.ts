import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const UserId = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx?.switchToHttp()?.getRequest()
    const userId = request?.userId

    return userId
  }
)
