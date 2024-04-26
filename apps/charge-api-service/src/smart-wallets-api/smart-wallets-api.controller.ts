import { AuthGuard } from '@nestjs/passport'
import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { SmartWalletsAuthDto } from '@app/smart-wallets-service/dto/smart-wallets-auth.dto'
import { SmartWalletsAPIService } from '@app/api-service/smart-wallets-api/smart-wallets-api.service'
import { RelayDto } from '@app/smart-wallets-service/smart-wallets/dto/relay.dto'
import { SmartWalletOwner } from '@app/common/decorators/smart-wallet-owner.decorator'
import { ISmartWalletUser } from '@app/common/interfaces/smart-wallet.interface'
import { ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { SmartWalletsAuth } from '@app/smart-wallets-service/entities/smart-wallets-auth.entity'

@ApiTags('Smart Wallets V1 API')
@UseGuards(IsValidPublicApiKeyGuard)
@Controller({ path: 'smart-wallets', version: '1' })
export class SmartWalletsAPIController {
  constructor (private readonly smartWalletsAPIService: SmartWalletsAPIService) { }

  @ApiOperation({ summary: 'Authenticate user using signed data standard EIP-191.' })
  @ApiParam({ name: 'apiKey', type: String, required: true })
  @ApiBody({ type: SmartWalletsAuth, required: true })
  @ApiCreatedResponse({ description: 'The response object.', type: Object })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @Post('auth')
  auth (@Body() smartWalletsAuthDto: SmartWalletsAuthDto) {
    return this.smartWalletsAPIService.auth(smartWalletsAuthDto)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  getWallet (@SmartWalletOwner() user: ISmartWalletUser) {
    return this.smartWalletsAPIService.getWallet(user)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  createWallet (@SmartWalletOwner() user: ISmartWalletUser) {
    return this.smartWalletsAPIService.createWallet(user)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('relay')
  relay (@Body() relayDto: RelayDto, @SmartWalletOwner() user: ISmartWalletUser) {
    relayDto.ownerAddress = user.ownerAddress
    return this.smartWalletsAPIService.relay(relayDto)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('historical_txs')
  getHistoricalTxs (@Query() query, @SmartWalletOwner() user: ISmartWalletUser) {
    user.query = query
    return this.smartWalletsAPIService.getHistoricalTxs(user)
  }
}
