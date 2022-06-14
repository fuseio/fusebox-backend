import { Controller, Get, Put, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { LegacyApiInterceptor } from '@app/api-service/legacy-api/legacy-api.interceptor'
import { IsValidApiKeysGuard } from '@app/api-service/api-keys/guards/is-valid-api-keys.guard'

@UseGuards(IsValidApiKeysGuard)
@UseInterceptors(LegacyApiInterceptor)
@Controller({ path: 'v0/wallets/*' })
export class LegacyWalletApiController {
  @Get()
  get () {
  }

  @Post()
  post () {
  }

  @Put()
  put () {
  }
}
