import { HttpException, Inject, Injectable } from '@nestjs/common'
import { networkServiceContext } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom, first } from 'rxjs'
import { WithdrawDto } from '@app/network-service/farm/dto/withdraw.dto'
import { DepositDto } from '@app/network-service/farm/dto/deposit.dto'
import { StakerInfoDto } from '@app/network-service/farm/dto/staker_info.dto'
import { WithdrawRewardDto } from '@app/network-service/farm/dto/withdraw_reward.dto'

@Injectable()
export class FarmAPIService {
  constructor (
    @Inject(networkServiceContext) private readonly farmClient: ClientProxy
  ) { }

  async withdraw (withdrawDto: WithdrawDto): Promise<any> {
    return this.callMSFunction(this.farmClient, 'withdraw', withdrawDto)
  }

  async deposit (depositDto: DepositDto): Promise<any> {
    console.log('depositDto', { ...depositDto })
    return this.callMSFunction(this.farmClient, 'deposit', depositDto)
  }

  async withdrawReward (withdrawRewardDto: WithdrawRewardDto): Promise<any> {
    return this.callMSFunction(this.farmClient, 'withdraw_reward', withdrawRewardDto)
  }

  async getStakerInfo (stakerInfoDto: StakerInfoDto): Promise<any> {
    return this.callMSFunction(this.farmClient, 'user_info', stakerInfoDto)
  }

  private async callMSFunction (client: ClientProxy, pattern: string, data: any) {
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
