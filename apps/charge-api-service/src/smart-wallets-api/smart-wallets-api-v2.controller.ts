import { Controller, Post, Body, UseGuards, Query, Get } from '@nestjs/common'
import { IsPrdOrSbxKeyGuard } from '@app/api-service/api-keys/guards/is-production-or-sandbox-key.guard'
import { SmartWalletsAuthDto } from '@app/smart-wallets-service/dto/smart-wallets-auth.dto'
import { SmartWalletsAPIService } from '@app/api-service/smart-wallets-api/smart-wallets-api.service'
import { AuthGuard } from '@nestjs/passport'
import { SmartWalletOwner } from '@app/common/decorators/smart-wallet-owner.decorator'
import { ISmartWalletUser } from '@app/common/interfaces/smart-wallet.interface'

@UseGuards(IsPrdOrSbxKeyGuard)
@Controller({ path: 'smart-wallets', version: '2' })
export class SmartWalletsAPIV2Controller {
  constructor (private readonly smartWalletsAPIService: SmartWalletsAPIService) { }

  @Post('auth')
  auth (@Body() smartWalletsAuthDto: SmartWalletsAuthDto) {
    return this.smartWalletsAPIService.auth(smartWalletsAuthDto)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('actions')
  getHistoricalTxs (
    @SmartWalletOwner() user: ISmartWalletUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tokenAddress') tokenAddress?: string
  ) {
    return this.smartWalletsAPIService.getWalletActions(user.smartWalletAddress, page, limit, tokenAddress)
  }
}
