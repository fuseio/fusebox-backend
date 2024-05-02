import { Controller, Post, Body, UseGuards, Query, Get, Logger } from '@nestjs/common'
import { IsPrdOrSbxKeyGuard } from '@app/api-service/api-keys/guards/is-production-or-sandbox-key.guard'
import { SmartWalletsAuthDto } from '@app/smart-wallets-service/dto/smart-wallets-auth.dto'
import { SmartWalletsAPIService } from '@app/api-service/smart-wallets-api/smart-wallets-api.service'
import { AuthGuard } from '@nestjs/passport'
import { SmartWalletOwner } from '@app/common/decorators/smart-wallet-owner.decorator'
import { ISmartWalletUser } from '@app/common/interfaces/smart-wallet.interface'
import { TokenTransferWebhookDto } from '@app/smart-wallets-service/smart-wallets/dto/token-transfer-webhook.dto'
import { Project } from '@app/common/decorators/project.decorator'
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, getSchemaPath } from '@nestjs/swagger'
import { SmartWalletsAuth } from '@app/smart-wallets-service/entities/smart-wallets-auth.entity'
import { TokenTransferWebhook } from '@app/smart-wallets-service/smart-wallets/entities/token-transfer-webhook.entity'

@ApiTags('Smart Wallets V2 API')
@Controller({ path: 'smart-wallets', version: '2' })
export class SmartWalletsAPIV2Controller {
  private readonly logger = new Logger(SmartWalletsAPIV2Controller.name)

  constructor (private readonly smartWalletsAPIService: SmartWalletsAPIService) { }

  @UseGuards(IsPrdOrSbxKeyGuard)
  @Post('auth')
  @ApiOperation({
    summary: 'Authenticate user',
    description: 'Authenticate user using signed data standard EIP-191.'
  })
  @ApiQuery({ name: 'apiKey', type: String, required: true, description: 'Your API key to authenticate requests.' })
  @ApiBody({ type: SmartWalletsAuth, required: true })
  @ApiCreatedResponse({ description: 'The response object.', type: Object })
  @ApiForbiddenResponse({ description: 'Access to the resource is forbidden.' })
  auth (@Project() projectId: string, @Body() smartWalletsAuthDto: SmartWalletsAuthDto) {
    smartWalletsAuthDto.projectId = projectId
    return this.smartWalletsAPIService.auth(smartWalletsAuthDto)
  }

  @UseGuards(AuthGuard('jwt'), IsPrdOrSbxKeyGuard)
  @Get('actions')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Wallet Actions',
    description: 'Get wallet actions associated with the wallet address.'
  })
  @ApiQuery({ name: 'apiKey', type: String, required: true, description: 'Your API key to authenticate requests.' })
  @ApiParam({ name: 'page', type: String, required: false, description: 'Page number for pagination.' })
  @ApiParam({ name: 'limit', type: String, required: false, description: 'Number of items per page.' })
  @ApiParam({ name: 'tokenAddress', type: String, required: false, description: 'Filter actions by token address.' })
  @ApiOkResponse({
    description: 'A list of wallet actions associated with the wallet address.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath('ActionResponseItems') }
      }
    }
  })
  @ApiForbiddenResponse({ description: 'Access to the resource is forbidden.' })
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
  @ApiCreatedResponse({ type: Object })
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
