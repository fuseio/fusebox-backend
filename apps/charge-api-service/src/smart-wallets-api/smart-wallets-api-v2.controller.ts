import { Controller, Post, Body, UseGuards, Query, Get, Logger, Headers, Req } from '@nestjs/common'
import { IsPrdOrSbxKeyGuard } from '@app/api-service/api-keys/guards/is-production-or-sandbox-key.guard'
import { SmartWalletsAuthDto } from '@app/smart-wallets-service/dto/smart-wallets-auth.dto'
import { SmartWalletsAPIService } from '@app/api-service/smart-wallets-api/smart-wallets-api.service'
import { AuthGuard } from '@nestjs/passport'
import { SmartWalletOwner } from '@app/common/decorators/smart-wallet-owner.decorator'
import { ISmartWalletUser } from '@app/common/interfaces/smart-wallet.interface'
import { TokenTransferWebhookDto } from '@app/smart-wallets-service/smart-wallets/dto/token-transfer-webhook.dto'

@Controller({ path: 'smart-wallets', version: '2' })
export class SmartWalletsAPIV2Controller {
  private readonly logger = new Logger(SmartWalletsAPIV2Controller.name)

  constructor (private readonly smartWalletsAPIService: SmartWalletsAPIService) { }

  @Post('auth')
  auth (@Body() smartWalletsAuthDto: SmartWalletsAuthDto) {
    return this.smartWalletsAPIService.auth(smartWalletsAuthDto)
  }

  @UseGuards(AuthGuard('jwt'), IsPrdOrSbxKeyGuard)
  @Get('actions')
  getHistoricalTxs (
    @SmartWalletOwner() user: ISmartWalletUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tokenAddress') tokenAddress?: string
  ) {
    return this.smartWalletsAPIService.getWalletActions(user.smartWalletAddress, page, limit, tokenAddress)
  }

  @Post('token-transfers')
  async handleTokenTransferWebhook (
    @Headers() headers: Headers,
    @Req() request: Request,
    @Body() tokenTransferWebhookDto: TokenTransferWebhookDto
  ) {
    this.logger.debug(
      'A request has been made to token-transfers:',
      JSON.stringify(tokenTransferWebhookDto),
      `headers.get('host'): ${headers.get('host')}`,
      `headers.get('origin'): ${headers.get('origin')}`
    )

    await this.smartWalletsAPIService.handleTokenTransferWebhook(
      tokenTransferWebhookDto
    )

    this.logger.debug('Returning OK response from the webhook endpoint...')

    return { data: 'ok' }
  }
}
