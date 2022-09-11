import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { StakeDto } from '@app/network-service/staking/dto/stake.dto'
import { UnstakeDto } from '@app/network-service/staking/dto/unstake.dto'
import { StakingService } from '@app/network-service/staking/staking.service'

@Controller('stake')
export class StakingController {
  constructor (private readonly stakingService: StakingService) { }

  @MessagePattern('staking_options')
  stakingOptions () {
    return this.stakingService.stakingOptions()
  }

  @MessagePattern('stake')
  stake (stakeDto: StakeDto) {
    return this.stakingService.stake(stakeDto)
  }

  @MessagePattern('unstake')
  unstake (unstakeDto: UnstakeDto) {
    return this.stakingService.unStake(unstakeDto)
  }

  @MessagePattern('staked_tokens')
  stakedTokens (accountAddress: string) {
    return this.stakingService.stakedTokens(accountAddress)
  }
}
