import { IsValidApiKeysGuard } from '@app/api-service/api-keys/guards/is-valid-api-keys.guard'
import { Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { LegacyApiInterceptor } from '@app/api-service/legacy-api/legacy-api.interceptor'

@UseGuards(IsValidApiKeysGuard)
@UseInterceptors(LegacyApiInterceptor)
@Controller({ path: 'v0/studio/*' })
export class LegacyStudioApiController {
  @Get()
  get () { }

  @Post()
  post () { }
}
