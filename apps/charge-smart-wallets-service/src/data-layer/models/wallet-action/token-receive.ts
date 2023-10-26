import { NATIVE_FUSE_TOKEN } from '@app/smart-wallets-service/common/constants/fuseTokenInfo'
import WalletAction from './base'
import { ERC20Transfer, ERC721Transfer } from '../../interfaces/token-interfaces'
import { ERC_721_TYPE, NATIVE_TOKEN_TYPE } from '@app/smart-wallets-service/common/constants/tokenTypes'

export class TokenReceive extends WalletAction {
  constructTokenTransferData (
    targetAddress: string,
    value: string,
    tokenType: string,
    { name, symbol, address, decimals },
    tokenId?: number
  ) {
    const token = this.getToken(tokenType, name, symbol, address, decimals)

    if (tokenType === ERC_721_TYPE) {
      return {
        ...token,
        type: ERC_721_TYPE,
        value,
        to: targetAddress,
        tokenId
      } as ERC721Transfer
    }

    return {
      ...token,
      type: tokenType === 'FUSE' ? NATIVE_TOKEN_TYPE : tokenType,
      value,
      to: targetAddress,
      tokenId
    } as ERC20Transfer
  }

  nftDescGenerator (nftInfo: { symbol: string, tokenId: number, from: string}) {
    return `${nftInfo.symbol} #${nftInfo.tokenId} received from ${nftInfo.from}`
  }

  private getToken (
    tokenType: string,
    name: string,
    symbol: string,
    address: string,
    decimals: number
  ) {
    if (tokenType === 'FUSE') return NATIVE_FUSE_TOKEN
    return { name, symbol, address, decimals }
  }

  constructResponse (
    fromWalletAddress: string,
    txHash: string,
    tokenTransferData: ERC20Transfer,
    blockNumber: number,
    tokenId?: number
  ) {
    const symbol = tokenTransferData.symbol
    const decimals = tokenTransferData.decimals

    let description: string

    if (tokenTransferData.type === ERC_721_TYPE) {
      description = this.nftDescGenerator({
        symbol, tokenId, from: fromWalletAddress
      })
    } else {
      description = this.generateDescription({
        action: 'Received',
        symbol,
        valueInWei: tokenTransferData.value,
        decimals
      })
    }

    return {
      walletAddress: fromWalletAddress,
      name: 'tokenReceive',
      status: 'success',
      sent: [tokenTransferData],
      txHash,
      blockNumber,
      description
    }
  }

  executeReceiveAction (
    fromWalletAddress: string,
    toWalletAddress: string,
    txHash: string,
    value: string,
    tokenType: string,
    { name, symbol, address, decimals },
    blockNumber: number,
    tokenId?: number
  ) {
    const tokenTransferData = this.constructTokenTransferData(
      toWalletAddress,
      value,
      tokenType,
      { name, symbol, address, decimals }
    )

    return this.constructResponse(
      fromWalletAddress, txHash, tokenTransferData, blockNumber, tokenId
    )
  }
}
