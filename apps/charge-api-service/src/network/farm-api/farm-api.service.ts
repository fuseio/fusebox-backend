import { HttpException, Inject, Injectable } from '@nestjs/common'
import { networkServiceContext } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom, takeLast } from 'rxjs'
import { WithdrawDto } from '@app/network-service/farm/dto/withdraw.dto'
import { DepositDto } from '@app/network-service/farm/dto/deposit.dto'
// import { DelegateDto } from 'apps/charge-network-service/src/staking/dto/delegate.dto'
// import { DelegatedAmountDto } from 'apps/charge-network-service/src/staking/dto/delegated_amount.dto'
// import { WithdrawDto } from 'apps/charge-network-service/src/staking/dto/withdraw.dto'

@Injectable()
export class FarmService {
  constructor (
    @Inject(networkServiceContext) private readonly farmClient: ClientProxy
  ) { }

  async withdraw (withdrawDto: WithdrawDto): Promise<any> {
    return this.callMSFunction(this.farmClient, 'withdraw', withdrawDto)
  }

  async deposit (depositDto: DepositDto): Promise<any> {
    return this.callMSFunction(this.farmClient, 'deposit', depositDto)
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
