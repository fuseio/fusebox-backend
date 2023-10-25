import WalletAction from './base'

export class TokenReceive extends WalletAction {
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

  // Rename it to executeReceiveAction
  async executeReceiveAction (
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
