import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard';
import { SmartAccountsAuthDto } from '@app/smart-accounts-service/dto/smart-accounts-auth.dto';
import { SmartAccountsService } from '@app/api-service/smart-accounts/smart-accounts.service';

@UseGuards(IsValidPublicApiKeyGuard)
@Controller('smart-accounts')
export class SmartAccountsController {
  constructor(private readonly smartAccountsService: SmartAccountsService) {}

  @Post('auth')
  auth(@Body() smartAccountsAuthDto: SmartAccountsAuthDto) {
    return this.smartAccountsService.auth(smartAccountsAuthDto)
  }
}
