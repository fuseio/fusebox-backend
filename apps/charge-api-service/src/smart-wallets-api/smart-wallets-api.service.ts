import { smartWalletsService } from '@app/common/constants/microservices.constants'
import { callMSFunction } from '@app/common/utils/client-proxy'
import { SmartWalletsAuthDto } from '@app/smart-wallets-service/dto/smart-wallets-auth.dto'
import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { RelayDto } from '@app/smart-wallets-service/smart-wallets/dto/relay.dto'
import { ISmartWalletUser } from '@app/common/interfaces/smart-wallet.interface'

@Injectable()
export class SmartWalletsAPIService {
  constructor (
    @Inject(smartWalletsService) private readonly smartWalletsClient: ClientProxy
  ) {}

  auth (smartWalletsAuthDto: SmartWalletsAuthDto) {
    return callMSFunction(this.smartWalletsClient, 'auth', smartWalletsAuthDto)
  }

  async getWallet (user: ISmartWalletUser): Promise<any> {
    return callMSFunction(this.smartWalletsClient, 'get_wallet', user)
  }

  async createWallet (user: ISmartWalletUser): Promise<any> {
    return callMSFunction(this.smartWalletsClient, 'create_wallet', user)
  }

  async relay (relayDto: RelayDto): Promise<any> {
    return callMSFunction(this.smartWalletsClient, 'relay', relayDto)
  }

  async getAvailableUpgrades (): Promise<any> {
    return callMSFunction(this.smartWalletsClient, 'get_available_upgrades', '')
  }

  async installUpgrade (): Promise<any> {
    return callMSFunction(this.smartWalletsClient, 'install_upgrade', '')
  }
}
