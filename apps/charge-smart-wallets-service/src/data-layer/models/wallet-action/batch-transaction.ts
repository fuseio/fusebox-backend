import { ERC_20_TYPE, ERC_721_TYPE, NATIVE_TOKEN_TYPE } from '@app/smart-wallets-service/common/constants/tokenTypes'
import WalletAction from '@app/smart-wallets-service/data-layer/models/wallet-action/base'
import { NATIVE_FUSE_TOKEN } from '@app/smart-wallets-service/common/constants/fuseTokenInfo'
import { ethers } from 'ethers'

export default class BatchTransaction extends WalletAction {
  descGenerator (data: any) {
    return `Batch transaction with ${data.sent.length} actions`
  }

  async fetchAndPrepareTokenData (functionDetail: any) {
    const actionName = functionDetail.name
    if (functionDetail.name === 'nativeTransfer') {
      return {
        type: NATIVE_TOKEN_TYPE,
        ...NATIVE_FUSE_TOKEN,
        to: functionDetail.targetAddress,
        value: functionDetail.value,
        actionName
      }
    }

    const tokenData = await this.tokenService.fetchTokenDetails(functionDetail.targetAddress)
    if (tokenData.decimals === 0) {
      const tokenIdObject = functionDetail.callData.find(item =>
        typeof item === 'object' && item._isBigNumber
      )
      const tokenId = tokenIdObject ? ethers.BigNumber.from(tokenIdObject._hex).toString() : '0'
      return {
        type: ERC_721_TYPE,
        name: tokenData.name,
        symbol: tokenData.symbol,
        decimals: 0,
        address: functionDetail.targetAddress,
        to: functionDetail.callData[0],
        tokenId,
        value: '0',
        actionName
      }
    } else {
      return {
        type: ERC_20_TYPE,
        name: tokenData.name,
        symbol: tokenData.symbol,
        decimals: tokenData.decimals,
        address: functionDetail.targetAddress,
        to: functionDetail.callData[0],
        value: functionDetail.callData[1].toString(),
        actionName
      }
    }
  }

  async execute (parsedUserOp: any) {
    try {
      const sent = []

      for (const functionDetail of parsedUserOp.targetFunctions) {
        const tokenTransferData = await this.fetchAndPrepareTokenData(functionDetail)
        sent.push(tokenTransferData)
      }

      return {
        walletAddress: parsedUserOp.sender,
        name: 'batchTransaction',
        status: 'pending',
        sent,
        userOpHash: parsedUserOp.userOpHash,
        txHash: '',
        blockNumber: 0,
        description: this.generateDescription({
          action: 'Batch',
          sent
        })
      }
    } catch (error) {
      throw new Error(error)
    }
  }
}
