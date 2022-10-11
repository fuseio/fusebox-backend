import { Inject, Injectable } from '@nestjs/common'
import { networkService } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
import { UnstakeDto } from '@app/network-service/staking/dto/unstake.dto'
import { StakeDto } from '@app/network-service/staking/dto/stake.dto'
import { StakingOption, UserStakedTokens } from '@app/network-service/staking/interfaces'
import { callMSFunction } from '@app/common/utils/client-proxy'

@Injectable()
export class StakingAPIService {
  constructor (
    @Inject(networkService) private readonly stakingClient: ClientProxy
  ) { }

  async stakingOptions (): Promise<Array<StakingOption>> {
    return callMSFunction(this.stakingClient, 'staking_options', {})
  }

  async stake (stakeDto: StakeDto): Promise<any> {
    return callMSFunction(this.stakingClient, 'stake', stakeDto)
  }

  async unStake (unstakeDto: UnstakeDto): Promise<any> {
    return callMSFunction(this.stakingClient, 'unstake', unstakeDto)
  }

  async stakedTokens (accountAddress: string): Promise<UserStakedTokens> {
    return callMSFunction(this.stakingClient, 'staked_tokens', accountAddress)
  }
}
