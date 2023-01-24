import { SmartAccountsAuthDto } from '@app/smart-accounts-service/dto/smart-accounts-auth.dto'
import { SmartAccountsService } from '@app/smart-accounts-service/smart-accounts/smart-accounts.service'
import { Body, Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'

@Controller('smart-accounts')
export class SmartAccountsController {
  constructor (private readonly smartAccountsService: SmartAccountsService) { }

    @MessagePattern('auth')
  auth (@Body() smartAccountsAuthDto: SmartAccountsAuthDto) {
    return this.smartAccountsService.auth(smartAccountsAuthDto)
  }
}
