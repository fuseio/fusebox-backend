import { Controller, Post, Body, UseGuards, Query, Get, Logger } from '@nestjs/common'
import { IsPrdOrSbxKeyGuard } from '@app/api-service/api-keys/guards/is-production-or-sandbox-key.guard'
import { SmartWalletsAuthDto } from '@app/smart-wallets-service/dto/smart-wallets-auth.dto'
import { SmartWalletsAPIService } from '@app/api-service/smart-wallets-api/smart-wallets-api.service'
import { AuthGuard } from '@nestjs/passport'
import { SmartWalletOwner } from '@app/common/decorators/smart-wallet-owner.decorator'
import { ISmartWalletUser } from '@app/common/interfaces/smart-wallet.interface'
import { TokenTransferWebhookDto } from '@app/smart-wallets-service/smart-wallets/dto/token-transfer-webhook.dto'
import { Project } from '@app/common/decorators/project.decorator'
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { SmartWalletsAuth } from '@app/smart-wallets-service/entities/smart-wallets-auth.entity'
import { TokenTransferWebhook } from '@app/smart-wallets-service/smart-wallets/entities/token-transfer-webhook.entity'

@ApiTags('Smart Wallets V2 API')
@Controller({ path: 'smart-wallets', version: '2' })
export class SmartWalletsAPIV2Controller {
  private readonly logger = new Logger(SmartWalletsAPIV2Controller.name)

  constructor (private readonly smartWalletsAPIService: SmartWalletsAPIService) { }

  @Post('auth')
  @UseGuards(IsPrdOrSbxKeyGuard)
  @ApiOperation({ summary: 'Authenticate user using signed data standard EIP-191.' })
  @ApiParam({ name: 'apiKey', type: String, required: true })
  @ApiBody({ type: SmartWalletsAuth, required: true })
  @ApiCreatedResponse({ description: 'The response object.', type: Object })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  auth (@Project() projectId: string, @Body() smartWalletsAuthDto: SmartWalletsAuthDto) {
    smartWalletsAuthDto.projectId = projectId
    return this.smartWalletsAPIService.auth(smartWalletsAuthDto)
  }

  @Get('actions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get wallet actions details.' })
  @ApiParam({ name: 'apiKey', type: String, required: true })
  @ApiParam({ name: 'page', type: String, required: false })
  @ApiParam({ name: 'limit', type: String, required: false })
  @ApiParam({ name: 'tokenAddress', type: String, required: false })
  @ApiCreatedResponse({ description: 'The wallet actions details.', type: Object })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @UseGuards(AuthGuard('jwt'), IsPrdOrSbxKeyGuard)
  getHistoricalTxs (
    @SmartWalletOwner() user: ISmartWalletUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tokenAddress') tokenAddress?: string
  ) {
    return this.smartWalletsAPIService.getWalletActions(user.smartWalletAddress, page, limit, tokenAddress)
  }

  @Post('token-transfers')
  @ApiOperation({ summary: 'Handle token transfer webhook.' })
  @ApiCreatedResponse({ description: 'The response object.', type: Object })
  @ApiBody({ type: TokenTransferWebhook, required: true })
  async handleTokenTransferWebhook (
    @Body() tokenTransferWebhookDto: TokenTransferWebhookDto
  ) {
    this.logger.debug(
      'A request has been made to token-transfers:',
      JSON.stringify(tokenTransferWebhookDto)
    )

    this.smartWalletsAPIService.handleTokenTransferWebhook(
      tokenTransferWebhookDto
    )

    this.logger.debug('Returning OK response from the webhook endpoint...')

    return { data: 'ok' }
  }
}
