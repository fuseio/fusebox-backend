import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { StakingAPIService } from '@app/api-service/staking-api/staking-api.service'
import { UnstakeDto } from '@app/network-service/staking/dto/unstake.dto'
import { StakeDto } from '@app/network-service/staking/dto/stake.dto'

@UseGuards(IsValidPublicApiKeyGuard)
@Controller('v2/staking')
export class StakingApiV2Controller {
  constructor (private readonly stakingAPIService: StakingAPIService) {}

  @Get('staking_options')
  stakingOptions () {
    return this.stakingAPIService.stakingOptionsV2()
  }

  @Post('stake')
  stake (@Body() stakeDto: StakeDto) {
    return this.stakingAPIService.stake(stakeDto)
  }

  @Post('unstake')
  unstake (@Body() unstakeDto: UnstakeDto) {
    return this.stakingAPIService.unStake(unstakeDto)
  }

  @Get('staked_tokens/:accountAddress')
  stakedTokens (@Param('accountAddress') accountAddress: string) {
    return this.stakingAPIService.stakedTokens(accountAddress)
  }
}
