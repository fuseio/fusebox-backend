import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { TransferDto } from '@app/network-service/transfer/dto/trasfer.dto'
import { WalletAddressDto } from '@app/network-service/transfer/dto/walletAddress.dto'
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { TransferApiService } from '@app/api-service/network/transfer-api/transfer-api.service'
import { allTransactionsDto } from '@app/network-service/transfer/dto/allTransactions.dto'
import { ContractAddressDto } from '@app/network-service/transfer/dto/contractAddress.dto'

// @UseGuards(IsValidPublicApiKeyGuard)
@Controller('v0/transfers')
export class TransferApiController {
  constructor (private readonly transferService: TransferApiService) { }

  @Post('/token')
  transferPost (@Body() transferDto: TransferDto) {
    return this.transferService.transferPost(transferDto)
  }

  @Post('/wallet-token-list')
  tokenListPost (@Body() walletAddressDto: WalletAddressDto) {
    return this.transferService.tokenListPost(walletAddressDto)
  }

  @Post('/token-holders')
  tokenHoldersPost (@Body() contractAddressDto: ContractAddressDto) {
    return this.transferService.tokenHoldersPost(contractAddressDto)
  }

  @Post('/all-transactions')
  allWalletTransactions (@Body() allTransactionsDto: allTransactionsDto) {
    return this.transferService.allWalletTransactions(allTransactionsDto)
  }
}
