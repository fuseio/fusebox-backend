import { Controller, Get, Post, UseGuards, UseInterceptors, Body, Param, Req, Request } from '@nestjs/common'
import { PaymasterApiInterceptor } from '@app/api-service/paymaster-api/paymaster-api.interceptor'
import { PaymasterApiService } from '@app/api-service/paymaster-api/paymaster-api.service'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { PublicApiKeyToProjectIdGuard } from '@app/api-service/api-keys/guards/public-api-key-to-project-id.guard'

@UseGuards(PublicApiKeyToProjectIdGuard)
@Controller({ path: 'v1/paymaster' })
export class PaymasterApiController {
  constructor(private readonly paymasterApiService: PaymasterApiService) { }


  @Get()
  getPaymasterData(@Req() req) {
    return this.paymasterApiService.getPaymasterData(req)
  }


}
