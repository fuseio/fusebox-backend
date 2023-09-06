import { smartWalletsService } from '@app/common/constants/microservices.constants'
import { callMSFunction } from '@app/common/utils/client-proxy'
import { SmartWalletsAuthDto } from '@app/smart-wallets-service/dto/smart-wallets-auth.dto'
import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { RelayDto } from '@app/smart-wallets-service/smart-wallets/dto/relay.dto'
import { ISmartWalletUser } from '@app/common/interfaces/smart-wallet.interface'
import { UserOp } from '@app/smart-wallets-service/data-layer/interfaces/user-op.interface'

@Injectable()
export class SmartWalletsAPIService {
  constructor (
    @Inject(smartWalletsService) private readonly smartWalletsClient: ClientProxy
  ) { }

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

  async getHistoricalTxs (user: ISmartWalletUser): Promise<any> {
    return callMSFunction(this.smartWalletsClient, 'historical_txs', user)
  }

  async getAvailableUpgrades (): Promise<any> {
    return callMSFunction(this.smartWalletsClient, 'get_available_upgrades', '')
  }

  async installUpgrade (): Promise<any> {
    return callMSFunction(this.smartWalletsClient, 'install_upgrade', '')
  }

  async recordUserOp (userOp: UserOp): Promise<any> {
    return callMSFunction(this.smartWalletsClient, 'record-user-op', userOp)
  }

  async updateUserOp (userOp: UserOp): Promise<any> {
    return callMSFunction(this.smartWalletsClient, 'update-user-op', userOp)
  }

  async getWalletActions (walletAddress, page): Promise<any> {
    return callMSFunction(this.smartWalletsClient, 'get-all-wallet-actions', { walletAddress, page })
  }
}
