import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { TransferService } from '@app/network-service/transfer/transfer.service'
import { TransferDto } from '@app/network-service/transfer/dto/trasfer.dto'
import { AddressDto } from '@app/network-service/transfer/dto/walletAddress.dto'

@Controller('transfer')
export class TransferController {
  constructor (private readonly transferService: TransferService) { }
    @MessagePattern('transferPost')
  transferPost (transferDto: TransferDto) {
    return this.transferService.transfersPost(transferDto)
  }

    @MessagePattern('tokenListPost')
    tokenBalancePost (addressDto: AddressDto) {
      return this.transferService.tokenListPost(addressDto)
    }

    @MessagePattern('tokenHoldersPost')
    tokenHoldersPost (addressDto: AddressDto) {
      return this.transferService.tokenHoldersPost(addressDto)
    }

    @MessagePattern('allWalletTransactions')
    allWalletTransactions (addressDto: AddressDto) {
      return this.transferService.allWalletTransactions(addressDto)
    }
}
