import { SmartWalletsAuthDto } from '@app/smart-wallets-service/dto/smart-wallets-auth.dto'
import { SmartWalletsV1 } from '@app/smart-wallets-service/smart-wallets/services/smart-wallets-v1.service'
import { SmartWalletsV2 } from '@app/smart-wallets-service/smart-wallets/services/smart-wallets-v2.service'
import { Body, Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { ISmartWalletUser } from '@app/common/interfaces/smart-wallet.interface'
import { RelayDto } from '@app/smart-wallets-service/smart-wallets/dto/relay.dto'

@Controller()
export class SmartWalletsController {
  constructor (
    private readonly smartWalletsV1Service: SmartWalletsV1,
    private readonly smartWalletsV2Service: SmartWalletsV2
  ) { }

  @MessagePattern('auth')
  auth (@Body() smartWalletsAuthDto: SmartWalletsAuthDto) {
    if (smartWalletsAuthDto.smartWalletAddress) {
      return this.smartWalletsV2Service.auth(smartWalletsAuthDto)
    } else {
      return this.smartWalletsV1Service.auth(smartWalletsAuthDto)
    }
  }

  @MessagePattern('get_wallet')
  getWallet (smartWalletUser: ISmartWalletUser) {
    return this.smartWalletsV1Service.getWallet(smartWalletUser)
  }

  @MessagePattern('create_wallet')
  createWallet (smartWalletUser: ISmartWalletUser) {
    return this.smartWalletsV1Service.createWallet(smartWalletUser)
  }

  @MessagePattern('relay')
  relay (relayDto: RelayDto) {
    return this.smartWalletsV1Service.relay(relayDto)
  }

  @MessagePattern('historical_txs')
  getHistoricalTxs (user: ISmartWalletUser) {
    return this.smartWalletsV1Service.getHistoricalTxs(user)
  }

  @MessagePattern('get_available_upgrades')
  getAvailableUpgrades () {
    return this.smartWalletsV1Service.getAvailableUpgrades()
  }

  @MessagePattern('install_upgrade')
  installUpgrade () {
    return this.smartWalletsV1Service.installUpgrade()
  }
}
