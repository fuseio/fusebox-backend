import { Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { LegacyApiInterceptor } from '@app/api-service/legacy-api/legacy-api.interceptor'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'

@UseGuards(IsValidPublicApiKeyGuard)
@UseInterceptors(LegacyApiInterceptor)
@Controller({ path: 'v0/trade/*' })
export class LegacyTradeApiController {
  @Get()
  get () {
  }

  @Post()
  post () {
  }
}
