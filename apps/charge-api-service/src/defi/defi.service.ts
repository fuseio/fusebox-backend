import { HttpException, Inject, Injectable } from '@nestjs/common'
import { defiServiceContext } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom, takeLast } from 'rxjs'
import { DelegateDto } from '@app/defi-service/staking/dto/delegate.dto'
import { DelegatedAmountDto } from '@app/defi-service/staking/dto/delegated_amount.dto'
import { WithdrawDto } from '@app/defi-service/staking/dto/withdraw.dto'

@Injectable()
export class DeFiService {
  constructor (
    @Inject(defiServiceContext) private readonly defiClient: ClientProxy
  ) { }

  async getEstimatedAPR (): Promise<any> {
    return this.callMSFunction(this.defiClient, 'estimated_apr', '')
  }

  async getTotalStakeAmount (): Promise<any> {
    return this.callMSFunction(this.defiClient, 'total_staked', '')
  }

  async withdraw (withdrawDto: WithdrawDto): Promise<any> {
    return this.callMSFunction(this.defiClient, 'withdraw', withdrawDto)
  }

  async delegate (delegateDto: DelegateDto): Promise<any> {
    return this.callMSFunction(this.defiClient, 'delegate', delegateDto)
  }

  async getDelegatedAmount (delegatedAmountDto: DelegatedAmountDto): Promise<any> {
    return this.callMSFunction(this.defiClient, 'delegated_amount', delegatedAmountDto)
  }

  async getValidators (): Promise<any> {
    return this.callMSFunction(this.defiClient, 'get_validators', '')
  }

  private async callMSFunction (client: ClientProxy, pattern: string, data: any) {
    return lastValueFrom(
      client
        .send(pattern, data)
        .pipe(takeLast(1))
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
