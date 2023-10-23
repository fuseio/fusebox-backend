import WalletAction from './base'

export class TokenReceiveAction extends WalletAction {
  constructResponse (
    fromWalletAddress: string,
    txHash: string,
    tokenTransferData: {value: string, symbol: string, decimals: string},
    blockNumber: number
  ) {
    const symbol = tokenTransferData.symbol
    const decimals = tokenTransferData.decimals

    return {
      walletAddress: fromWalletAddress,
      name: 'tokenReceive',
      status: 'success',
      sent: [tokenTransferData],
      txHash,
      blockNumber,
      description: this.generateDescription({
        action: 'Received',
        symbol,
        valueInWei: tokenTransferData.value,
        decimals
      })
    }
  }

  async createWalletAction (
    fromWalletAddress: string,
    txHash: string,
    tokenTransferData: {value: string, symbol: string, decimals: string},
    blockNumber: number
  ) {
    return this.constructResponse(
      fromWalletAddress, txHash, tokenTransferData, blockNumber
    )
  }
}
