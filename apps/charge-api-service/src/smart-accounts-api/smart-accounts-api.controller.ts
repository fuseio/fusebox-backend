import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { SmartAccountsAuthDto } from '@app/smart-accounts-service/dto/smart-accounts-auth.dto'
import { SmartAccountsAPIService } from '@app/api-service/smart-accounts-api/smart-accounts-api.service'

@UseGuards(IsValidPublicApiKeyGuard)
@Controller({path: 'smart-accounts', version: '1'})
export class SmartAccountsAPIController {
  constructor (private readonly smartAccountsService: SmartAccountsAPIService) {}

  @Post('auth')
  auth (@Body() smartAccountsAuthDto: SmartAccountsAuthDto) {
    return this.smartAccountsService.auth(smartAccountsAuthDto)
  }
}
