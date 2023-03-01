import { SmartWalletsAuthDto } from '@app/smart-wallets-service/dto/smart-wallets-auth.dto'
import { SmartWalletsService } from '@app/smart-wallets-service/smart-wallets/smart-wallets.service'
import { Body, Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { ISmartWalletUser } from '@app/common/interfaces/smart-wallet.interface'
import { RelayDto } from '@app/smart-wallets-service/smart-wallets/dto/relay.dto'

@Controller()
export class SmartWalletsController {
  constructor (private readonly smartWalletsService: SmartWalletsService) { }

  @MessagePattern('auth')
  auth (@Body() smartWalletsAuthDto: SmartWalletsAuthDto) {
    return this.smartWalletsService.auth(smartWalletsAuthDto)
  }

  @MessagePattern('get_wallet')
  getWallet (smartWalletUser: ISmartWalletUser) {
    return this.smartWalletsService.getWallet(smartWalletUser)
  }

  @MessagePattern('create_wallet')
  createWallet (smartWalletUser: ISmartWalletUser) {
    return this.smartWalletsService.createWallet(smartWalletUser)
  }

  @MessagePattern('relay')
  relay (relayDto: RelayDto) {
    return this.smartWalletsService.relay(relayDto)
  }

  @MessagePattern('historical_txs')
  getHistoricalTxs (user: ISmartWalletUser) {
    return this.smartWalletsService.getHistoricalTxs(user)
  }

  @MessagePattern('get_available_upgrades')
  getAvailableUpgrades () {
    return this.smartWalletsService.getAvailableUpgrades()
  }

  @MessagePattern('install_upgrade')
  installUpgrade () {
    return this.smartWalletsService.installUpgrade()
  }
}
