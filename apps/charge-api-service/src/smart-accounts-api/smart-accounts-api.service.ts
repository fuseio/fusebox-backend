import { smartAccountsService } from '@app/common/constants/microservices.constants'
import { callMSFunction } from '@app/common/utils/client-proxy'
import { SmartAccountsAuthDto } from '@app/smart-accounts-service/dto/smart-accounts-auth.dto'
import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { RelayDto } from '@app/smart-accounts-service/smart-accounts/dto/relay.dto'
import { ISmartAccountUser } from '@app/common/interfaces/smart-account.interface'

@Injectable()
export class SmartAccountsAPIService {
  constructor (
    @Inject(smartAccountsService) private readonly smartAccountsClient: ClientProxy
  ) {}

  auth (smartAccountsAuthDto: SmartAccountsAuthDto) {
    return callMSFunction(this.smartAccountsClient, 'auth', smartAccountsAuthDto)
  }

  async getWallet (user: ISmartAccountUser): Promise<any> {
    return callMSFunction(this.smartAccountsClient, 'get_wallet', user)
  }

  async createWallet (user: ISmartAccountUser): Promise<any> {
    return callMSFunction(this.smartAccountsClient, 'create_wallet', user)
  }

  async relay (relayDto: RelayDto): Promise<any> {
    return callMSFunction(this.smartAccountsClient, 'relay', relayDto)
  }

  async getAvailableUpgrades (): Promise<any> {
    return callMSFunction(this.smartAccountsClient, 'get_available_upgrades', '')
  }

  async installUpgrade (): Promise<any> {
    return callMSFunction(this.smartAccountsClient, 'install_upgrade', '')
  }
}
