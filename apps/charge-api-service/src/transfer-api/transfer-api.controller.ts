import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { TransferDto } from '@app/network-service/transfer/dto/token-transfer.dto'
import { WalletAddressDto } from '@app/network-service/transfer/dto/wallet-address.dto'
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { TransferApiService } from '@app/api-service/transfer-api/transfer-api.service'
import { AllTransactionsDto } from '@app/network-service/transfer/dto/all-transactions.dto'
import { ContractAddressDto } from '@app/network-service/transfer/dto/contract-address.dto'

// @UseGuards(IsValidPublicApiKeyGuard)
@Controller('v0/transfers')
export class TransferApiController {
  constructor(private readonly transferService: TransferApiService) { }


  /**
     * Getting token trasfers for each token address from RPC include minting.
     * Filter parameterss must be in the body of request
     * @param transferDto
     * @returns Array of tokens transfers for each token address.
     */
  @Post('/token')
  transferPost(@Body() transferDto: TransferDto) {
    return this.transferService.transferPost(transferDto)
  }


  /**
     * @param walletAddressDto
     * @returns Array of tokens held by wallet address
     * Explorer call
     */
  @Post('/wallet-token-list')
  tokenListPost(@Body() walletAddressDto: WalletAddressDto) {
    return this.transferService.tokenListPost(walletAddressDto)
  }


  /**
     * @param contractAddressDto
     * @returns Returns all the wallets that are holding token by token address
     * Explorer call
     */
  @Post('/token-holders')
  tokenHoldersPost(@Body() contractAddressDto: ContractAddressDto) {
    return this.transferService.tokenHoldersPost(contractAddressDto)
  }

  /**
    * @param allTransactionsDto
    * @returns Returns all (regular,internal,erc-20) transactions for wallet address
    * Explorer call
    */
  @Post('/all-transactions')
  allWalletTransactions(@Body() allTransactionsDto: AllTransactionsDto) {
    return this.transferService.allWalletTransactions(allTransactionsDto)
  }
}
