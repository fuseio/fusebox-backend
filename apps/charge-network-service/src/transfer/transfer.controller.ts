import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { TransferService } from '@app/network-service/transfer/transfer.service'
import { TransferDto } from '@app/network-service/transfer/dto/trasfer.dto'
import { WalletAddressDto } from '@app/network-service/transfer/dto/walletAddress.dto'
import { allTransactionsDto } from '@app/network-service/transfer/dto/allTransactions.dto'
import { ContractAddressDto } from '@app/network-service/transfer/dto/contractAddress.dto'

@Controller('transfer')
export class TransferController {
  constructor (private readonly transferService: TransferService) { }
  @MessagePattern('transferPost')
  transferPost (transferDto: TransferDto) {
    return this.transferService.transfersPost(transferDto)
  }

  @MessagePattern('tokenListPost')
  tokenBalancePost (walletAddressDto: WalletAddressDto) {
    return this.transferService.tokenListPost(walletAddressDto)
  }

  @MessagePattern('tokenHoldersPost')
  tokenHoldersPost (contractAddressDto: ContractAddressDto) {
    return this.transferService.tokenHoldersPost(contractAddressDto)
  }

  @MessagePattern('allWalletTransactions')
  allWalletTransactions (allTransactionsDto: allTransactionsDto) {
    return this.transferService.allWalletTransactions(allTransactionsDto)
  }
}
