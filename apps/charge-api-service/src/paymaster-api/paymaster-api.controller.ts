import { Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { PaymasterApiInterceptor } from '@app/api-service/paymaster-api/paymaster-api.interceptor'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { PublicApiKeyToSponsorIdGuard } from '@app/api-service/api-keys/guards/public-api-key-to-sponsor-id.guard'

@UseInterceptors(PaymasterApiInterceptor)
@UseGuards(PublicApiKeyToSponsorIdGuard)
@Controller({ path: 'v1/paymaster' })
export class PaymasterApiController {
  @Get()
  get() {
  }

  @Post()
  post() {
  }
}
