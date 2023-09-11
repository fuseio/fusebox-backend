import { AuthGuard } from '@nestjs/passport'
import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { SmartWalletsAuthDto } from '@app/smart-wallets-service/dto/smart-wallets-auth.dto'
import { SmartWalletsAPIService } from '@app/api-service/smart-wallets-api/smart-wallets-api.service'
import { RelayDto } from '@app/smart-wallets-service/smart-wallets/dto/relay.dto'
import { SmartWalletOwner } from '@app/common/decorators/smart-wallet-owner.decorator'
import { ISmartWalletUser } from '@app/common/interfaces/smart-wallet.interface'
import { UserOp } from '@app/smart-wallets-service/data-layer/interfaces/user-op.interface'

@UseGuards(IsValidPublicApiKeyGuard)
@Controller({ path: 'smart-wallets', version: '1' })
export class SmartWalletsAPIController {
  constructor(private readonly smartWalletsAPIService: SmartWalletsAPIService) { }

  @Post('auth')
  auth(@Body() smartWalletsAuthDto: SmartWalletsAuthDto) {
    return this.smartWalletsAPIService.auth(smartWalletsAuthDto)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  getWallet(@SmartWalletOwner() user: ISmartWalletUser) {
    return this.smartWalletsAPIService.getWallet(user)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  createWallet(@SmartWalletOwner() user: ISmartWalletUser) {
    return this.smartWalletsAPIService.createWallet(user)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('relay')
  relay(@Body() relayDto: RelayDto, @SmartWalletOwner() user: ISmartWalletUser) {
    relayDto.ownerAddress = user.ownerAddress
    return this.smartWalletsAPIService.relay(relayDto)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('historical_txs')
  getHistoricalTxs(@Query() query, @SmartWalletOwner() user: ISmartWalletUser) {
    user.query = query
    return this.smartWalletsAPIService.getHistoricalTxs(user)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('available_upgrades')
  getAvailableUpgrades(@SmartWalletOwner() user: ISmartWalletUser) {
    return this.smartWalletsAPIService.getAvailableUpgrades()
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('install_upgrade')
  installUpgrade(@SmartWalletOwner() user: ISmartWalletUser) {
    return this.smartWalletsAPIService.installUpgrade()
  }

  @Post('record-user-op')
  recordUserop(@Body() userOp: UserOp) {
    return this.smartWalletsAPIService.recordUserOp(userOp)
  }

  // @Post('update-user-op')
  // updateUserop(@Body() userOp: UserOp) {
  //   return this.smartWalletsAPIService.updateUserOp(userOp)
  // }

  // @Get('get-wallet-actions')
  // getWalletActions(
  //   @Query('walletAddress') walletAddress: string,
  //   @Query('page') page?: string
  // ) {
  //   return this.smartWalletsAPIService.getWalletActions(walletAddress, page)
  // }
}
