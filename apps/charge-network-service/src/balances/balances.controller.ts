import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import BalancesService from 'apps/charge-network-service/src/balances/balances.service'

@Controller('balances')
export class BalancesController {
  constructor (
    private readonly balancesService: BalancesService
  ) { }

  @MessagePattern('get_erc20_token_balances')
  getERC20TokenBalances (data: { address: string; tokenAddress?: string }) {
    return this.balancesService.getERC20TokenBalances(data.address, data.tokenAddress)
  }

  @MessagePattern('get_erc721_token_balances')
  getERC721TokenBalances (data: { address: string; limit?: number; cursor?: string }) {
    return this.balancesService.getERC721TokenBalances(data.address, data.limit, data.cursor)
  }
}
