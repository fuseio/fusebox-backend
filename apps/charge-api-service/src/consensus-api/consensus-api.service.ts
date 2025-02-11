import { Inject, Injectable } from '@nestjs/common'
import { networkService } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'
import { DelegatedAmountsDto } from '@app/network-service/consensus/dto/delegate.dto'

@Injectable()
export class ConsensusApiService {
  constructor (
    @Inject(networkService) private readonly networkClient: ClientProxy
  ) { }

  async getValidators (): Promise<Map<string, any>> {
    return callMSFunction(this.networkClient, 'get_validators', {})
  }

  async getDelegatedAmounts (delegatedAmountsDto: DelegatedAmountsDto): Promise<Map<string, any>> {
    return callMSFunction(this.networkClient, 'delegated_amounts', delegatedAmountsDto)
  }

  async delegate (validator: string): Promise<string> {
    return callMSFunction(this.networkClient, 'delegate', { validator })
  }

  async withdraw (validator: string, amount: string): Promise<string> {
    return callMSFunction(this.networkClient, 'withdraw', { validator, amount })
  }
}
