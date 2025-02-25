import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { StakeDto } from '@app/network-service/staking/dto/stake.dto'
import { UnstakeDto } from '@app/network-service/staking/dto/unstake.dto'
import { StakingService } from '@app/network-service/staking/staking.service'

@Controller('stake')
export class StakingController {
  constructor (private readonly stakingService: StakingService) {}

  @MessagePattern('staking_options')
  stakingOptions () {
    return this.stakingService.stakingOptions()
  }

  @MessagePattern('staking_options_v2')
  stakingOptionsV2 () {
    return this.stakingService.stakingOptionsV2()
  }

  @MessagePattern('stake')
  stake (stakeDto: StakeDto) {
    return this.stakingService.stake(stakeDto)
  }

  @MessagePattern('stake_v2')
  stakeV2 (stakeDto: StakeDto) {
    return this.stakingService.stakeV2(stakeDto)
  }

  @MessagePattern('unstake')
  unstake (unstakeDto: UnstakeDto) {
    return this.stakingService.unStake(unstakeDto)
  }

  @MessagePattern('unstake_v2')
  unstakeV2 (unstakeDto: UnstakeDto) {
    return this.stakingService.unStakeV2(unstakeDto)
  }

  @MessagePattern('staked_tokens')
  stakedTokens (accountAddress: string) {
    return this.stakingService.stakedTokens(accountAddress)
  }

  @MessagePattern('staked_tokens_v2')
  stakedTokensV2 (accountAddress: string) {
    return this.stakingService.stakedTokensV2(accountAddress)
  }
}
