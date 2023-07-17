import { Controller, Get, UseGuards, Req } from '@nestjs/common'
import { PaymasterApiService } from '@app/api-service/paymaster-api/paymaster-api.service'
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
