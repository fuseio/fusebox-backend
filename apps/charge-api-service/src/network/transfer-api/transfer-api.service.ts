import { HttpException, Inject, Injectable } from '@nestjs/common';
import { networkServiceContext } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom, takeLast } from 'rxjs'
import { TransferDto } from '@app/network-service/transfer/dto/trasfer.dto';

@Injectable()
export class TransferApiService {
  constructor(
    @Inject(networkServiceContext) private readonly networkClient: ClientProxy
  ) { }


  async transferPost(transferDto: TransferDto): Promise<any> {
    return this.callMSFunction(this.networkClient, 'transferPost', transferDto)
  }

  private async callMSFunction(client: ClientProxy, pattern: string, data: any) {
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
