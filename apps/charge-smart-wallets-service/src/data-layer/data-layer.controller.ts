import { DataLayerService } from '@app/smart-wallets-service/data-layer/data-layer.service'
import { Body, Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { BaseUserOp, UserOp } from '@app/smart-wallets-service/data-layer/interfaces/user-op.interface'
import { TokenTransferWebhookDto } from '@app/smart-wallets-service/smart-wallets/dto/token-transfer-webhook.dto'

@Controller()
export class DataLayerController {
  constructor (private readonly dataLayerService: DataLayerService) { }

  @MessagePattern('record-user-op')
  create (@Body() userOp: BaseUserOp) {
    return this.dataLayerService.recordUserOp(userOp)
  }

  @MessagePattern('update-user-op')
  update (@Body() userOp: UserOp) {
    return this.dataLayerService.updateUserOp(userOp)
  }

  @MessagePattern('get-all-wallet-actions')
  get (@Body() data: any) {
    return this.dataLayerService.getPaginatedWalletActions(data.page, data.walletAddress, data.limit, data.tokenAddress)
  }

  @MessagePattern('handle-token-transfer-webhook')
  handleTokenTransferWebhook (tokenTransferWebhookDto: TokenTransferWebhookDto) {
    return this.dataLayerService.handleTokenTransferWebhook(
      tokenTransferWebhookDto
    )
  }

  @MessagePattern('sponsored-transactions-count')
  sponsoredTransactionsCount (apiKey: string) {
    return this.dataLayerService.findSponsoredTransactionsCount(
      apiKey
    )
  }
}
