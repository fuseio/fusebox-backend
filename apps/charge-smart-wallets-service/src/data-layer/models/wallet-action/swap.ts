// import { ERC_20_TYPE, NATIVE_TOKEN_TYPE } from '@app/smart-wallets-service/common/constants/tokenTypes'
import { ERC_20_TYPE, NATIVE_TOKEN_TYPE } from '../../../common/constants/tokenTypes'
import WalletAction from './base'
import { ERC20Transfer } from '../../interfaces/token-interfaces'
// import { NATIVE_FUSE_TOKEN } from '@app/smart-wallets-service/common/constants/fuseTokenInfo'
import { NATIVE_FUSE_TOKEN } from '../../../common/constants/fuseTokenInfo'
import { first, last } from 'lodash'
import { formatUnits } from 'nestjs-ethers'

export default class SwapTokens extends WalletAction {
  descGenerator(data: any) {
    const sentValue = formatUnits(data.sentTokenValueInWei, data.sentTokenDecimals)
    const recValue = formatUnits(data.recTokenValueInWei, data.recTokenDecimals)
    return `${sentValue} ${data.sentToken} was swapped to ${recValue} ${data.recToken}`
  }

  async execute(parsedUserOp: any) {
    const { name: walletFunctionName } = parsedUserOp.walletFunction
    let call
    if (walletFunctionName === 'executeBatch') {
      call = last(parsedUserOp.targetFunctions)
    } else if (walletFunctionName === 'execute') {
      call = first(parsedUserOp.targetFunctions)
    }

    const { name, callData } = call

    if (name === 'swapTokensForExactTokens') {
      const [amountOut, amountInMax, path, to] = callData
      const tokenOut = first(path)
      const tokenIn = last(path)
      const sentTokenData = await this.tokenService.fetchTokenDetails(tokenOut as string)
      const receivedTokenData = await this.tokenService.fetchTokenDetails(tokenIn as string)
      const sentTokenDetails: ERC20Transfer = {
        type: ERC_20_TYPE,
        ...sentTokenData,
        to,
        value: amountInMax.toString()
      }

      const receivedTokenDetails: ERC20Transfer = {
        type: ERC_20_TYPE,
        ...receivedTokenData,
        value: amountOut.toString(),
        to: parsedUserOp.sender
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
          sentToken: sentTokenData.symbol,
          sentTokenDecimals: sentTokenData.decimals,
          sentTokenValueInWei: sentTokenDetails.value,
          recToken: receivedTokenData.symbol,
          recTokenDecimals: receivedTokenData.decimals,
          recTokenValueInWei: receivedTokenDetails.value
        })
      }
    } else if (name === 'swapExactTokensForTokens') {
      const [amountIn, amountOutMin, path, to] = callData
      const tokenOut = first(path)
      const tokenIn = last(path)
      const sentTokenData = await this.tokenService.fetchTokenDetails(tokenOut as string)
      const receivedTokenData = await this.tokenService.fetchTokenDetails(tokenIn as string)
      const sentTokenDetails: ERC20Transfer = {
        type: ERC_20_TYPE,
        ...sentTokenData,
        to,
        value: amountIn.toString()
      }

      const receivedTokenDetails: ERC20Transfer = {
        type: ERC_20_TYPE,
        ...receivedTokenData,
        value: amountOutMin.toString(),
        to: parsedUserOp.sender
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
          sentToken: sentTokenData.symbol,
          sentTokenDecimals: sentTokenData.decimals,
          sentTokenValueInWei: sentTokenDetails.value,
          recToken: receivedTokenData.symbol,
          recTokenDecimals: receivedTokenData.decimals,
          recTokenValueInWei: receivedTokenDetails.value
        })
      }
    } else if (name === 'swapExactETHForTokens') {
      const { value } = call
      const [amountOutMin, path, to] = callData
      // const tokenOut = first(path)
      const tokenIn = last(path)
      // const sentTokenData = await fetchTokenDetails(tokenOut)
      const receivedTokenData = await this.tokenService.fetchTokenDetails(tokenIn as string)
      const sentTokenDetails: ERC20Transfer = {
        type: NATIVE_TOKEN_TYPE,
        ...NATIVE_FUSE_TOKEN,
        to,
        value: value.toString()
      }

      const receivedTokenDetails: ERC20Transfer = {
        type: ERC_20_TYPE,
        ...receivedTokenData,
        value: amountOutMin.toString(),
        to: parsedUserOp.sender
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
          recToken: receivedTokenData.symbol,
          recTokenDecimals: receivedTokenData.decimals,
          recTokenValueInWei: receivedTokenDetails.value
        })
      }
    } else if (name === 'swapTokensForExactETH') {
      const [amountOut, amountInMax, path, to] = callData
      const tokenOut = first(path)
      const sentTokenData = await this.tokenService.fetchTokenDetails(tokenOut as string)
      const sentTokenDetails: ERC20Transfer = {
        type: ERC_20_TYPE,
        ...sentTokenData,
        to,
        value: amountInMax.toString()
      }

      const receivedTokenDetails: ERC20Transfer = {
        type: NATIVE_TOKEN_TYPE,
        ...NATIVE_FUSE_TOKEN,
        value: amountOut.toString(),
        to: parsedUserOp.sender
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
    } else if (name === 'swapExactTokensForETH') {
      const [amountIn, amountOutMin, path, to] = callData
      const tokenOut = first(path)
      const sentTokenData = await this.tokenService.fetchTokenDetails(tokenOut as string)
      const sentTokenDetails: ERC20Transfer = {
        type: ERC_20_TYPE,
        ...sentTokenData,
        to,
        value: amountIn.toString()
      }

      const receivedTokenDetails: ERC20Transfer = {
        type: NATIVE_TOKEN_TYPE,
        ...NATIVE_FUSE_TOKEN,
        value: amountOutMin.toString(),
        to: parsedUserOp.sender
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
    } else if (name === 'swapETHForExactTokens') {
      const { value } = call
      const [amountOut, path, to] = callData
      const tokenOut = first(path)
      const receiveTokenData = await this.tokenService.fetchTokenDetails(tokenOut as string)
      const sentTokenDetails: ERC20Transfer = {
        type: ERC_20_TYPE,
        ...receiveTokenData,
        to,
        value: value.toString()
      }

      const receivedTokenDetails: ERC20Transfer = {
        type: NATIVE_TOKEN_TYPE,
        ...NATIVE_FUSE_TOKEN,
        value: amountOut.toString(),
        to: parsedUserOp.sender
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
    } else if (name === 'withdraw') {
      const { targetAddress } = call
      const [value] = callData
      const tokenData = await this.tokenService.fetchTokenDetails(targetAddress as string)
      const sentTokenData: ERC20Transfer = {
        type: ERC_20_TYPE,
        ...tokenData,
        value: value.toString(),
        to: parsedUserOp.sender
      }

      const receivedTokenData: ERC20Transfer = {
        type: NATIVE_TOKEN_TYPE,
        ...NATIVE_FUSE_TOKEN,
        to: parsedUserOp.sender,
        value
      }

      return {
        name: 'swapTokens',
        walletAddress: parsedUserOp.sender,
        status: 'pending',
        sent: [sentTokenData],
        received: [receivedTokenData],
        userOpHash: parsedUserOp.userOpHash,
        txHash: '',
        blockNumber: 0,
        description: this.generateDescription({
          action: 'Swapped',
          sentToken: sentTokenData.symbol,
          sentTokenDecimals: sentTokenData.decimals,
          sentTokenValueInWei: sentTokenData.value,
          recToken: receivedTokenData.symbol,
          recTokenDecimals: receivedTokenData.decimals,
          recTokenValueInWei: receivedTokenData.value
        })
      }
    } else if (name === 'deposit') {
      const { targetAddress, value } = call
      const tokenData = await this.tokenService.fetchTokenDetails(targetAddress)
      const sentTokenData: ERC20Transfer = {
        type: NATIVE_TOKEN_TYPE,
        ...NATIVE_FUSE_TOKEN,
        value: value.toString(),
        to: parsedUserOp.sender
      }

      const receivedTokenData: ERC20Transfer = {
        type: ERC_20_TYPE,
        ...tokenData,
        to: parsedUserOp.sender,
        value
      }

      return {
        name: 'swapTokens',
        walletAddress: parsedUserOp.sender,
        status: 'pending',
        sent: [sentTokenData],
        received: [receivedTokenData],
        userOpHash: parsedUserOp.userOpHash,
        txHash: '',
        blockNumber: 0,
        description: this.generateDescription({
          action: 'Swapped',
          sentToken: sentTokenData.symbol,
          sentTokenDecimals: sentTokenData.decimals,
          sentTokenValueInWei: sentTokenData.value,
          recToken: receivedTokenData.symbol,
          recTokenDecimals: receivedTokenData.decimals,
          recTokenValueInWei: receivedTokenData.value
        })
      }
    }
  }
}
