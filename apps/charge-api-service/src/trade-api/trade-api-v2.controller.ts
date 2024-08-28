import { Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common'

import { ApiTags } from '@nestjs/swagger'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { TradeApiInterceptor } from '@app/api-service/trade-api/trade-api.interceptor'

@ApiTags('Trade V2')
@UseGuards(IsValidPublicApiKeyGuard)
@UseInterceptors(TradeApiInterceptor)
@Controller({ path: 'v1/trade/*' })
export class TradeApiV2Controller {
  @Get()
  get () {
  }

  @Post()
  post () {
  }
}
