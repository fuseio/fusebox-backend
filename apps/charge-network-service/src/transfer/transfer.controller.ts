import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { TransferService } from '@app/network-service/transfer/transfer.service'
import { TransferDto } from '@app/network-service/transfer/dto/token-transfer.dto'
import { WalletAddressDto } from '@app/network-service/transfer/dto/wallet-address.dto'
import { AllTransactionsDto } from '@app/network-service/transfer/dto/all-transactions.dto'
import { ContractAddressDto } from '@app/network-service/transfer/dto/contract-address.dto'

@Controller('transfer')
export class TransferController {
  constructor(private readonly transferService: TransferService) { }
  @MessagePattern('transferPost')
  transferPost(transferDto: TransferDto) {
    return this.transferService.transfersPost(transferDto)
  }

  @MessagePattern('tokenListPost')
  tokenBalancePost(walletAddressDto: WalletAddressDto) {
    return this.transferService.tokenListPost(walletAddressDto)
  }

  @MessagePattern('tokenHoldersPost')
  tokenHoldersPost(contractAddressDto: ContractAddressDto) {
    return this.transferService.tokenHoldersPost(contractAddressDto)
  }

  @MessagePattern('allWalletTransactions')
  allWalletTransactions(allTransactionsDto: AllTransactionsDto) {
    return this.transferService.allWalletTransactions(allTransactionsDto)
  }
}
