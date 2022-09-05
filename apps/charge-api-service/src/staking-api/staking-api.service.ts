import { HttpException, Inject, Injectable } from '@nestjs/common'
import { networkServiceContext } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom, first } from 'rxjs'
import { UnstakeDto } from '@app/network-service/staking/dto/unstake.dto'
import { StakeDto } from '@app/network-service/staking/dto/stake.dto'
import { StakingOption, UserStakedTokens } from '@app/network-service/staking/interfaces'

@Injectable()
export class StakingAPIService {
  constructor (
    @Inject(networkServiceContext) private readonly stakingClient: ClientProxy
  ) { }

  async stakingOptions (): Promise<Array<StakingOption>> {
    return this.callMSFunction(this.stakingClient, 'staking_options')
  }

  async stake (stakeDto: StakeDto): Promise<any> {
    return this.callMSFunction(this.stakingClient, 'stake', stakeDto)
  }

  async unStake (unstakeDto: UnstakeDto): Promise<any> {
    return this.callMSFunction(this.stakingClient, 'unstake', unstakeDto)
  }

  async stakedTokens (accountAddress: string): Promise<UserStakedTokens> {
    return this.callMSFunction(this.stakingClient, 'staked_tokens', accountAddress)
  }

  private async callMSFunction (client: ClientProxy, pattern: string, data?: any) {
    return lastValueFrom(
      client
        .send(pattern, data)
        .pipe(first())
        .pipe(
          catchError((val) => {
            throw new HttpException(
              val.message,
              val.status
            )
          })
        )
    )
  }
}
