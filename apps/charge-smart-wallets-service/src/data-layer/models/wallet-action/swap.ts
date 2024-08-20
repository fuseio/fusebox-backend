import { ERC_20_TYPE, NATIVE_TOKEN_TYPE } from '@app/smart-wallets-service/common/constants/tokenTypes'
import WalletAction from '@app/smart-wallets-service/data-layer/models/wallet-action/base'
import { ERC20Transfer } from '@app/smart-wallets-service/data-layer/interfaces/token-interfaces'
import { NATIVE_FUSE_TOKEN } from '@app/smart-wallets-service/common/constants/fuseTokenInfo'
import { formatUnits } from 'nestjs-ethers'

export default class TokenSwapExecutor extends WalletAction {
  descGenerator (data: any) {
    const sentValue = formatUnits(data.sentTokenValueInWei, data.sentTokenDecimals)
    const recValue = formatUnits(data.recTokenValueInWei, data.recTokenDecimals)
    return `${sentValue} ${data.sentToken} was swapped to ${recValue} ${data.recToken}`
  }

  async execute (parsedUserOp: any) {
    const transformERC20Function = parsedUserOp.targetFunctions.find(
      (func: any) => func.name === 'transformERC20'
    )

    if (!transformERC20Function) {
      throw new Error('transformERC20 function not found in targetFunctions')
    }

    const { callData } = transformERC20Function
    const [inputToken, outputToken, inputTokenAmount, minOutputTokenAmount] = callData

    const isInputNative = inputToken.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    const isOutputNative = outputToken.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

    const sentTokenData = isInputNative
      ? NATIVE_FUSE_TOKEN
      : await this.tokenService.fetchTokenDetails(inputToken)
    const receivedTokenData = isOutputNative
      ? NATIVE_FUSE_TOKEN
      : await this.tokenService.fetchTokenDetails(outputToken)

    const sentTokenDetails: ERC20Transfer = {
      type: isInputNative ? NATIVE_TOKEN_TYPE : ERC_20_TYPE,
      ...sentTokenData,
      to: parsedUserOp.sender,
      value: inputTokenAmount.toString()
    }

    const receivedTokenDetails: ERC20Transfer = {
      type: isOutputNative ? NATIVE_TOKEN_TYPE : ERC_20_TYPE,
      ...receivedTokenData,
      to: parsedUserOp.sender,
      value: minOutputTokenAmount.toString()
    }

    return {
      name: 'swapTokens',
      walletAddress: parsedUserOp.sender,
      status: 'pending',
      sent: [sentTokenDetails],
      received: [receivedTokenDetails],
      userOpHash: parsedUserOp.userOpHash,
      txHash: '',
      blockNumber: 0,
      description: this.generateDescription({
        action: 'Swapped',
        sentToken: sentTokenDetails.symbol,
        sentTokenDecimals: sentTokenDetails.decimals,
        sentTokenValueInWei: sentTokenDetails.value,
        recToken: receivedTokenDetails.symbol,
        recTokenDecimals: receivedTokenDetails.decimals,
        recTokenValueInWei: receivedTokenDetails.value
      })
    }
  }
}
