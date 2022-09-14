import { HttpException, Inject, Injectable } from '@nestjs/common'
import { networkServiceContext } from '@app/common/constants/microservices.constants'
import { WalletAddressDto } from '@app/network-service/transfer/dto/wallet-address.dto'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom, takeLast } from 'rxjs'
import { TransferDto } from '@app/network-service/transfer/dto/token-transfer.dto'
import { AllTransactionsDto } from '@app/network-service/transfer/dto/all-transactions.dto'
import { ContractAddressDto } from '@app/network-service/transfer/dto/contract-address.dto'

@Injectable()
export class TransferApiService {
  constructor(
    @Inject(networkServiceContext) private readonly networkClient: ClientProxy
  ) { }

  async transferPost(transferDto: TransferDto): Promise<any> {
    return this.callMSFunction(this.networkClient, 'transferPost', transferDto)
  }

  async tokenListPost(walletAddressDto: WalletAddressDto): Promise<any> {
    return this.callMSFunction(this.networkClient, 'tokenListPost', walletAddressDto)
  }

  async tokenHoldersPost(contractAddressDto: ContractAddressDto): Promise<any> {
    return this.callMSFunction(this.networkClient, 'tokenHoldersPost', contractAddressDto)
  }

  async allWalletTransactions(allTransactionsDto: AllTransactionsDto): Promise<any> {
    return this.callMSFunction(this.networkClient, 'allWalletTransactions', allTransactionsDto)
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
