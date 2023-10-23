import { Injectable } from '@nestjs/common'
import { TokenTransferWebhookDto } from '../dto/token-transfer-webhook.dto'
import { WalletActionDocument } from '@app/smart-wallets-service/data-layer/schemas/wallet-action.schema'
import { Model } from 'mongoose'
import { tokenReceiveToWalletAction } from '@app/smart-wallets-service/common/utils/wallet-action-factory'

@Injectable()
export class TokenTransferWebhookService {
  constructor (
    private readonly walletActionModel: Model<WalletActionDocument>
  ) {}

  async handleTokenTransferWebhook (tokenTransferWebhookDto: TokenTransferWebhookDto) {
    const from = tokenTransferWebhookDto.from

    const txHash = tokenTransferWebhookDto.txHash

    const value = tokenTransferWebhookDto.value
    const symbol = tokenTransferWebhookDto.tokenSymbol
    const decimals = tokenTransferWebhookDto.tokenDecimals

    const blockNumber = tokenTransferWebhookDto.blockNumber

    // TODO: Check if this implementation supports incoming NFTs.

    const walletAction = tokenReceiveToWalletAction(
      from,
      txHash,
      { value, symbol, decimals },
      blockNumber
    )

    await this.walletActionModel.create(walletAction)
  }
}
