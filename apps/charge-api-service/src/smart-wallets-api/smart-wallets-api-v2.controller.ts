import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { SmartWalletsAuthDto } from '@app/smart-wallets-service/dto/smart-wallets-auth.dto'
import { SmartWalletsAPIService } from '@app/api-service/smart-wallets-api/smart-wallets-api.service'

@UseGuards(IsValidPublicApiKeyGuard)
@Controller({ path: 'smart-wallets', version: '2' })
export class SmartWalletsAPIV2Controller {
  constructor (private readonly smartWalletsAPIService: SmartWalletsAPIService) {}

  @Post('auth')
  auth (@Body() smartWalletsAuthDto: SmartWalletsAuthDto) {
    return this.smartWalletsAPIService.auth(smartWalletsAuthDto)
  }

  // TODO: Implement the following endpoint when the data layer is ready
  // @UseGuards(AuthGuard('jwt'))
  // @Get('actions')
  // getHistoricalTxs (@Query() query, @SmartWalletOwner() user: ISmartWalletUser) {
  // }
}
