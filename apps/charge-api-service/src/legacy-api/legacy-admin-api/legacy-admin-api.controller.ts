import { IsValidApiKeysGuard } from '@app/api-service/api-keys/guards/is-valid-api-keys.guard'
import { Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { LegacyApiInterceptor } from '@app/api-service/legacy-api/legacy-api.interceptor'

@UseGuards(IsValidApiKeysGuard)
@UseInterceptors(LegacyApiInterceptor)
@Controller({ path: 'v0/admin' })
export class LegacyAdminApiController {
  @Get('/wallets/*')
  getWallets() {}

  @Get('/tokens/*')
  getTokens() {}
  
  @Get('/*')
  get () { }

  @Post('/*')
  post () { }
}
