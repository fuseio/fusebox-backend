import { ERC_721_TYPE } from '@app/smart-wallets-service/common/constants/tokenTypes'
import WalletAction from '@app/smart-wallets-service/data-layer/models/wallet-action/base'
import { ERC721Transfer } from '@app/smart-wallets-service/data-layer/interfaces/token-interfaces'

export default class NftTransfer extends WalletAction {
  descGenerator ({ symbol, tokenId, to }) {
    return `${symbol} #${tokenId} sent to ${to}`
  }

  async fetchTokenTransferData ({ targetAddress, callData }) {
    const [, to, tokenId] = callData
    const tokenData = await this.tokenService.fetchTokenDetails(targetAddress)
    return {
      type: ERC_721_TYPE,
      ...tokenData,
      to,
      tokenId
    } as ERC721Transfer
  }

  constructResponse (parsedUserOp, tokenTransferData) {
    const { sender: walletAddress, userOpHash } = parsedUserOp
    const { tokenId, to, symbol } = tokenTransferData
    return {
      walletAddress,
      name: 'nftTransfer',
      status: 'pending',
      sent: [tokenTransferData],
      userOpHash,
      txHash: '',
      blockNumber: 0,
      description: this.descGenerator({ tokenId, to, symbol })
    }
  }

  async execute (parsedUserOp) {
    const targetFunction = parsedUserOp.targetFunctions[0]
    const tokenTransferData = await this.fetchTokenTransferData(targetFunction)
    return this.constructResponse(parsedUserOp, tokenTransferData)
  }
}
