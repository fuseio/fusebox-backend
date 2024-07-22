import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import BalancesService from 'apps/charge-network-service/src/balances/balances.service'

@Controller('balances')
export class BalancesController {
  constructor (
    private readonly balancesService: BalancesService
  ) { }

  @MessagePattern('get_erc20_token_balances')
  getERC20TokenBalances (address: string) {
    return this.balancesService.getERC20TokenBalances(address)
  }

  @MessagePattern('get_erc721_token_balances')
  getERC721TokenBalances (address: string) {
    return this.balancesService.getERC721TokenBalances(address)
  }
}
