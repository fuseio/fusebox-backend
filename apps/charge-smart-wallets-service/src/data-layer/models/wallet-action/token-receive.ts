import { NATIVE_FUSE_TOKEN } from '@app/smart-wallets-service/common/constants/fuseTokenInfo'
import WalletAction from '@app/smart-wallets-service/data-layer/models/wallet-action/base'
import { ERC20Transfer, ERC721Transfer } from '@app/smart-wallets-service/data-layer/interfaces/token-interfaces'
import { ERC_721_TYPE, NATIVE_TOKEN_TYPE, TRADE_SWAP_SKIP } from '@app/smart-wallets-service/common/constants/tokenTypes'

const SKIP_SWAP_CONTRACT_ADDRESS = '0x63ed5bBa94D397616aD482BB26bB21E0feceF1a5'

type TokenTransferData = ERC20Transfer | ERC721Transfer | { type: string }

export class TokenReceive extends WalletAction {
  constructTokenTransferData (
    targetAddress: string,
    value: string,
    tokenType: string,
    { name, symbol, address, decimals },
    tokenId?: number
  ): TokenTransferData {
    if (targetAddress.toLowerCase() === SKIP_SWAP_CONTRACT_ADDRESS.toLowerCase()) {
      return { type: TRADE_SWAP_SKIP }
    }

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
      from: targetAddress,
      tokenId
    } as ERC20Transfer
  }

  nftDescGenerator (nftInfo: { symbol: string, tokenId: number, from: string }) {
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
    tokenTransferData: TokenTransferData,
    blockNumber: number,
    tokenId?: number
  ) {
    if ('type' in tokenTransferData && tokenTransferData.type === TRADE_SWAP_SKIP) {
      return null
    }

    const symbol = 'symbol' in tokenTransferData ? tokenTransferData.symbol : ''
    const decimals = 'decimals' in tokenTransferData ? tokenTransferData.decimals : 0

    let description: string

    if (tokenTransferData.type === ERC_721_TYPE) {
      description = this.nftDescGenerator({
        symbol, tokenId, from: fromWalletAddress
      })
    } else {
      description = this.generateDescription({
        action: 'Received',
        symbol,
        valueInWei: 'value' in tokenTransferData ? tokenTransferData.value : '0',
        decimals
      })
    }

    const name =
      tokenTransferData.type === ERC_721_TYPE ? 'nftReceive' : 'tokenReceive'

    return {
      walletAddress: fromWalletAddress,
      name,
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
      fromWalletAddress,
      value,
      tokenType,
      { name, symbol, address, decimals },
      tokenId
    )

    return this.constructResponse(
      toWalletAddress, txHash, tokenTransferData, blockNumber, tokenId
    )
  }
}
