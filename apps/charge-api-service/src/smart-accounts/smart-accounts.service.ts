import { smartAccountsService } from '@app/common/constants/microservices.constants';
import { SmartAccountsAuthDto } from '@app/smart-accounts-service/dto/smart-accounts-auth.dto';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom, takeLast } from 'rxjs';
import { CreateSmartAccountDto } from '../../../charge-smart-accounts-service/src/dto/create-smart-account.dto';

@Injectable()
export class SmartAccountsService {
  constructor (
    @Inject(smartAccountsService) private readonly smartAccountsClient: ClientProxy
) {}

  auth(smartAccountsAuthDto: SmartAccountsAuthDto) {
    return this.callMSFunction(this.smartAccountsClient, 'auth', smartAccountsAuthDto)
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
