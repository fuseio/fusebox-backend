import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { DeFiService } from '@app/api-service/defi/defi.service'
import { DelegateDto } from '@app/defi-service/staking/dto/delegate.dto'
import { DelegatedAmountDto } from '@app/defi-service/staking/dto/delegated_amount.dto'
import { WithdrawDto } from '@app/defi-service/staking/dto/withdraw.dto'

@UseGuards(IsValidPublicApiKeyGuard)
@Controller('v0/defi')
export class DeFiController {
  constructor (private readonly defiService: DeFiService) { }

  @Get('total_staked')
  getTotalStakeAmount () {
    return this.defiService.getTotalStakeAmount()
  }

  @Post('withdraw')
  withdraw (@Body() withdrawDto: WithdrawDto) {
    return this.defiService.withdraw(withdrawDto)
  }

  @Post('delegate')
  delegate (@Body() delegateDto: DelegateDto) {
    return this.defiService.delegate(delegateDto)
  }

  @Post('delegated_amount')
  delegatedAmount (@Body() delegatedAmountDto: DelegatedAmountDto) {
    return this.defiService.getDelegatedAmount(delegatedAmountDto)
  }

  @Get('validators')
  getValidators () {
    return this.defiService.getValidators()
  }

  @Get('estimated_apr')
  getEstimatedAPR () {
    return this.defiService.getEstimatedAPR()
  }
}
