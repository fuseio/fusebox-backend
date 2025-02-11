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
    if (!parsedUserOp || typeof parsedUserOp !== 'object') {
      throw new Error('Invalid parsedUserOp: not an object')
    }

    const { walletFunction, targetFunctions } = parsedUserOp

    if (walletFunction && typeof walletFunction === 'object') {
      const { name: walletFunctionName, targetFunctions: walletFunctionTargetFunctions } = walletFunction

      if (Array.isArray(walletFunctionTargetFunctions)) {
        if (walletFunctionName === 'executeBatch') {
          return this.handleBatchExecution(parsedUserOp, walletFunctionTargetFunctions)
        } else {
          return this.handleSingleExecution(parsedUserOp, walletFunctionTargetFunctions[0])
        }
      }
    }

    if (Array.isArray(targetFunctions)) {
      if (targetFunctions.length > 1) {
        return this.handleBatchExecution(parsedUserOp, targetFunctions)
      } else {
        return this.handleSingleExecution(parsedUserOp, targetFunctions[0])
      }
    }

    throw new Error('Invalid or missing targetFunctions in parsedUserOp')
  }

  private async handleBatchExecution (parsedUserOp: any, targetFunctions: any[]) {
    for (const func of targetFunctions) {
      const { name, targetAddress, callData, value } = func || {}

      if (!name) {
        console.log('Skipping function with no name')
        continue
      }

      if (name === 'transformERC20') {
        return this.handleTransformERC20(parsedUserOp, callData)
      } else if (name === 'withdraw') {
        return this.handleWithdraw(parsedUserOp, targetAddress, callData)
      } else if (name === 'deposit') {
        return this.handleDeposit(parsedUserOp, targetAddress, value)
      }
    }

    throw new Error('Unsupported swap operation in batch execution')
  }

  private async handleSingleExecution (parsedUserOp: any, targetFunction: any) {
    if (!targetFunction) {
      throw new Error('Missing targetFunction in single execution')
    }

    const { name, targetAddress, callData, value } = targetFunction

    if (!name) {
      throw new Error('Missing name in targetFunction')
    }

    if (name === 'transformERC20') {
      return this.handleTransformERC20(parsedUserOp, callData)
    } else if (name === 'withdraw') {
      return this.handleWithdraw(parsedUserOp, targetAddress, callData)
    } else if (name === 'deposit') {
      return this.handleDeposit(parsedUserOp, targetAddress, value)
    }

    throw new Error(`Unsupported swap operation: ${name}`)
  }

  private async handleTransformERC20 (parsedUserOp: any, callData: any[]) {
    const [inputToken, outputToken, inputTokenAmount, minOutputTokenAmount] = callData

    const isInputNative = inputToken.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    const isOutputNative = outputToken.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

    const sentTokenData = isInputNative
      ? NATIVE_FUSE_TOKEN
      : await this.tokenService.fetchTokenDetails(inputToken)
    const receivedTokenData = isOutputNative
      ? NATIVE_FUSE_TOKEN
      : await this.tokenService.fetchTokenDetails(outputToken)

    return this.constructSwapResponse(parsedUserOp, {
      sentToken: {
        ...sentTokenData,
        type: isInputNative ? NATIVE_TOKEN_TYPE : ERC_20_TYPE,
        value: inputTokenAmount.toString()
      },
      receivedToken: {
        ...receivedTokenData,
        type: isOutputNative ? NATIVE_TOKEN_TYPE : ERC_20_TYPE,
        value: minOutputTokenAmount.toString()
      }
    })
  }

  private async handleWithdraw (parsedUserOp: any, targetAddress: string, callData: any[]) {
    const [value] = callData
    const tokenData = await this.tokenService.fetchTokenDetails(targetAddress)

    return this.constructSwapResponse(parsedUserOp, {
      sentToken: {
        ...tokenData,
        type: ERC_20_TYPE,
        value: value.toString()
      },
      receivedToken: {
        ...NATIVE_FUSE_TOKEN,
        type: NATIVE_TOKEN_TYPE,
        value: value.toString()
      }
    })
  }

  private async handleDeposit (parsedUserOp: any, targetAddress: string, value: string) {
    const tokenData = await this.tokenService.fetchTokenDetails(targetAddress)

    return this.constructSwapResponse(parsedUserOp, {
      sentToken: {
        ...NATIVE_FUSE_TOKEN,
        type: NATIVE_TOKEN_TYPE,
        value: value.toString()
      },
      receivedToken: {
        ...tokenData,
        type: ERC_20_TYPE,
        value: value.toString()
      }
    })
  }

  private constructSwapResponse (parsedUserOp: any, { sentToken, receivedToken }: { sentToken: ERC20Transfer, receivedToken: ERC20Transfer }) {
    return {
      name: 'swapTokens',
      walletAddress: parsedUserOp.sender,
      status: 'pending',
      sent: [{ ...sentToken, to: parsedUserOp.sender }],
      received: [{ ...receivedToken, to: parsedUserOp.sender }],
      userOpHash: parsedUserOp.userOpHash,
      txHash: '',
      blockNumber: 0,
      description: this.generateDescription({
        action: 'Swapped',
        sentToken: sentToken.symbol,
        sentTokenDecimals: sentToken.decimals,
        sentTokenValueInWei: sentToken.value,
        recToken: receivedToken.symbol,
        recTokenDecimals: receivedToken.decimals,
        recTokenValueInWei: receivedToken.value
      })
    }
  }
}
