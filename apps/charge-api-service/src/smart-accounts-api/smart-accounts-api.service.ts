import { smartAccountsService } from '@app/common/constants/microservices.constants'
import { callMSFunction } from '@app/common/utils/client-proxy'
import { SmartAccountsAuthDto } from '@app/smart-accounts-service/dto/smart-accounts-auth.dto'
import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class SmartAccountsAPIService {
  constructor (
    @Inject(smartAccountsService) private readonly smartAccountsClient: ClientProxy
  ) {}

  auth (smartAccountsAuthDto: SmartAccountsAuthDto) {
    return callMSFunction(this.smartAccountsClient, 'auth', smartAccountsAuthDto)
  }
}
