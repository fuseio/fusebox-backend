import { SmartAccountsAuthDto } from '@app/smart-accounts-service/dto/smart-accounts-auth.dto'
import { SmartAccountsService } from '@app/smart-accounts-service/smart-accounts/smart-accounts.service'
import { Body, Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { ISmartAccountUser } from '@app/common/interfaces/smart-account.interface'
import { RelayDto } from '@app/smart-accounts-service/smart-accounts/dto/relay.dto'

@Controller('smart-accounts')
export class SmartAccountsController {
  constructor (private readonly smartAccountsService: SmartAccountsService) { }

  @MessagePattern('auth')
  auth (@Body() smartAccountsAuthDto: SmartAccountsAuthDto) {
    return this.smartAccountsService.auth(smartAccountsAuthDto)
  }

  @MessagePattern('get_wallet')
  getWallet (smartAccountUser: ISmartAccountUser) {
    return this.smartAccountsService.getWallet(smartAccountUser)
  }

  @MessagePattern('create_wallet')
  createWallet (smartAccountUser: ISmartAccountUser) {
    return this.smartAccountsService.createWallet(smartAccountUser)
  }

  @MessagePattern('relay')
  relay (relayDto: RelayDto) {
    return this.smartAccountsService.relay(relayDto)
  }

  @MessagePattern('get_available_upgrades')
  getAvailableUpgrades () {
    return this.smartAccountsService.getAvailableUpgrades()
  }

  @MessagePattern('install_upgrade')
  installUpgrade () {
    return this.smartAccountsService.installUpgrade()
  }
}
