import { AuthGuard } from '@nestjs/passport'
import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { SmartAccountsAuthDto } from '@app/smart-accounts-service/dto/smart-accounts-auth.dto'
import { SmartAccountsAPIService } from '@app/api-service/smart-accounts-api/smart-accounts-api.service'
import { Project } from '@app/common/decorators/project.decorator'
import { RelayDto } from '@app/smart-accounts-service/smart-accounts/dto/relay.dto'
import { SmartAccountOwner } from '@app/common/decorators/smart-account-owner.decorator'
import { ISmartAccountUser } from '@app/common/interfaces/smart-account.interface'

@UseGuards(IsValidPublicApiKeyGuard)
@Controller({ path: 'smart-accounts', version: '1' })
export class SmartAccountsAPIController {
  constructor (private readonly smartAccountsAPIService: SmartAccountsAPIService) {}

  @Post('auth')
  auth (@Body() smartAccountsAuthDto: SmartAccountsAuthDto, @Project() projectId: string) {
    smartAccountsAuthDto.projectId = projectId
    return this.smartAccountsAPIService.auth(smartAccountsAuthDto)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('get_wallet')
  getWallet (@SmartAccountOwner() user: ISmartAccountUser) {
    return this.smartAccountsAPIService.getWallet(user)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create_wallet')
  createWallet (@SmartAccountOwner() user: ISmartAccountUser) {
    return this.smartAccountsAPIService.createWallet(user)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('relay')
  relay (@Body() relayDto: RelayDto, @SmartAccountOwner() user: ISmartAccountUser) {
    relayDto.projectId = user.projectId
    return this.smartAccountsAPIService.relay(relayDto)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('available_upgrades')
  getAvailableUpgrades (@SmartAccountOwner() user: ISmartAccountUser) {
    return this.smartAccountsAPIService.getAvailableUpgrades()
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('install_upgrade')
  installUpgrade (@SmartAccountOwner() user: ISmartAccountUser) {
    return this.smartAccountsAPIService.installUpgrade()
  }
}
