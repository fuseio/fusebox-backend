import { SmartWalletsAuthDto } from '@app/smart-wallets-service/dto/smart-wallets-auth.dto'
import { SmartWalletsLegacyService } from '@app/smart-wallets-service/smart-wallets/services/smart-wallets-legacy.service'
import { SmartWalletsAAService } from '@app/smart-wallets-service/smart-wallets/services/smart-wallets-aa.service'
import { Body, Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { ISmartWalletUser } from '@app/common/interfaces/smart-wallet.interface'
import { RelayDto } from '@app/smart-wallets-service/smart-wallets/dto/relay.dto'

@Controller()
export class SmartWalletsController {
  constructor (
    private readonly legacyService: SmartWalletsLegacyService,
    private readonly aaService: SmartWalletsAAService
  ) { }

  @MessagePattern('auth')
  auth (@Body() smartWalletsAuthDto: SmartWalletsAuthDto) {
    if (smartWalletsAuthDto.smartWalletAddress) {
      return this.aaService.auth(smartWalletsAuthDto)
    } else {
      return this.legacyService.auth(smartWalletsAuthDto)
    }
  }

  @MessagePattern('get_wallet')
  getWallet (smartWalletUser: ISmartWalletUser) {
    return this.legacyService.getWallet(smartWalletUser)
  }

  @MessagePattern('create_wallet')
  createWallet (smartWalletUser: ISmartWalletUser) {
    return this.legacyService.createWallet(smartWalletUser)
  }

  @MessagePattern('relay')
  relay (relayDto: RelayDto) {
    return this.legacyService.relay(relayDto)
  }

  @MessagePattern('historical_txs')
  getHistoricalTxs (user: ISmartWalletUser) {
    return this.legacyService.getHistoricalTxs(user)
  }

  @MessagePattern('get_available_upgrades')
  getAvailableUpgrades () {
    return this.legacyService.getAvailableUpgrades()
  }

  @MessagePattern('install_upgrade')
  installUpgrade () {
    return this.legacyService.installUpgrade()
  }
}
