import { Inject, Injectable } from '@nestjs/common'
import { networkService } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'

@Injectable()
export class BalancesAPIService {
  constructor (
    @Inject(networkService) private readonly networkClient: ClientProxy
  ) { }

  async getERC20TokenBalances (address: string): Promise<any> {
    return callMSFunction(this.networkClient, 'get_erc20_token_balances', address)
  }

  async getERC721TokenBalances (address: string, limit: number = 100, cursor?: string): Promise<any> {
    return callMSFunction(this.networkClient, 'get_erc721_token_balances', { address, limit, cursor })
  }
}
