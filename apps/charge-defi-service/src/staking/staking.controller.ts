import { Controller } from '@nestjs/common'
import { StakingService } from 'apps/charge-defi-service/src/staking/staking.service'
import { MessagePattern } from '@nestjs/microservices'
import { DelegateDto } from '@app/defi-service/staking/dto/delegate.dto'
import { DelegatedAmountDto } from '@app/defi-service/staking/dto/delegated_amount.dto'
import { WithdrawDto } from '@app/defi-service/staking/dto/withdraw.dto'

@Controller()
export class StakingController {
  constructor (private readonly stakingService: StakingService) { }

  @MessagePattern('estimated_apr')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getEstimatedAPR (value: string) {
    return this.stakingService.getEstimatedAPR()
  }

  @MessagePattern('total_staked')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTotalStakedAmount (value: string) {
    return this.stakingService.getTotalStakeAmount()
  }

  @MessagePattern('withdraw')
  withdraw (withdrawDto: WithdrawDto) {
    return this.stakingService.withdraw(withdrawDto)
  }

  @MessagePattern('delegate')
  delegate (delegateDto: DelegateDto) {
    return this.stakingService.delegate(delegateDto)
  }

  @MessagePattern('delegated_amount')
  getDelegatedAmount (delegatedAmountDto: DelegatedAmountDto) {
    return this.stakingService.getDelegatedAmount(delegatedAmountDto)
  }

  @MessagePattern('get_validators')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getValidators (value: string) {
    return this.stakingService.getValidators()
  }
}
