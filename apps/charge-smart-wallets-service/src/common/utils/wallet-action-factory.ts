import { NATIVE_FUSE_TOKEN } from '@app/smart-wallets-service/common/constants/fuseTokenInfo'
import { fetchTokenDetails } from '@app/smart-wallets-service/common/utils/token'
import { NATIVE_TOKEN_TYPE, ERC_20_TYPE, ERC_721_TYPE } from '@app/smart-wallets-service/common/constants/tokenTypes'
import { ERC721TransferInterface, ERC20TransferInterface } from '@app/smart-wallets-service/data-layer/interfaces/token-interfaces'
import { LIQUID_STAKING_POOL } from '../constants/addresess'

// Base class for all operations
abstract class WalletAction {
  async execute (parsedUserOp: any): Promise<any> {
    return null
  }

  abstract descGenerator(data: any): string;

  generateDescription (data: any) {
    return this.descGenerator(data)
  }
}

// Sealed classes for each operation type
class NativeTokenTransfer extends WalletAction {
  descGenerator (data: any) {
    return `${data.action} ${data.valueInWei / Math.pow(10, data.decimals)} ${data.symbol}`
  }

  async execute (parsedUserOp: any) {
    const tokenTransferData: ERC20TransferInterface = {
      type: NATIVE_TOKEN_TYPE,
      name: NATIVE_FUSE_TOKEN.name,
      symbol: NATIVE_FUSE_TOKEN.symbol,
      address: NATIVE_FUSE_TOKEN.address,
      decimals: NATIVE_FUSE_TOKEN.decimals,
      value: parsedUserOp.walletFunction.arguments[1],
      to: parsedUserOp.walletFunction.arguments[0]
    }
    return {
      walletAddress: parsedUserOp.sender,
      name: 'tokenTransfer',
      status: 'pending',
      sent: [tokenTransferData],
      userOpHash: parsedUserOp.userOpHash,
      txHash: '',
      blockNumber: 0,
      description: this.generateDescription({
        action: 'Transferred',
        symbol: NATIVE_FUSE_TOKEN.symbol,
        valueInWei: parsedUserOp.walletFunction.arguments[1],
        decimals: NATIVE_FUSE_TOKEN.decimals
      })
    }
  }
}

class ERC20Transfer extends WalletAction {
  descGenerator (data: any) {
    return `${data.action} ${data.valueInWei / Math.pow(10, data.decimals)} ${data.symbol}`
  }

  async execute (parsedUserOp: any) {
    try {
      const tokenData = await fetchTokenDetails(parsedUserOp.walletFunction.arguments[0])
      const tokenTransferData: ERC20TransferInterface = {
        type: ERC_20_TYPE,
        name: tokenData.name,
        symbol: tokenData.symbol,
        decimals: tokenData.decimals,
        address: parsedUserOp.walletFunction.arguments[0],
        to: parsedUserOp.targetFunction[0].arguments[0],
        value: parsedUserOp.targetFunction[0].arguments[1]
      }
      return {
        walletAddress: parsedUserOp.sender,
        name: 'tokenTransfer',
        status: 'pending',
        sent: [tokenTransferData],
        userOpHash: parsedUserOp.userOpHash,
        txHash: '',
        blockNumber: 0,
        description: this.generateDescription({
          action: 'Transferred',
          symbol: tokenData.symbol,
          valueInWei: parsedUserOp.targetFunction[0].arguments[1],
          decimals: tokenData.decimals
        })
      }
    } catch (error) {
      throw new Error(error)
    }
  }
}
class NftTransfer extends WalletAction {
  descGenerator (data: any) {
    return `${data.symbol} #${data.tokenId} sent to ${data.to}`
  }

  async execute (parsedUserOp: any) {
    try {
      const tokenData = await fetchTokenDetails(parsedUserOp.walletFunction.arguments[0])
      const tokenTransferData: ERC721TransferInterface = {
        type: ERC_721_TYPE,
        name: tokenData.name,
        decimals: tokenData.decimals,
        symbol: tokenData.symbol,
        address: parsedUserOp.walletFunction.arguments[0],
        to: parsedUserOp.targetFunction[0].arguments[0],
        tokenId: parsedUserOp.targetFunction[0].arguments[2],
        value: '0'
      }
      return {
        walletAddress: parsedUserOp.sender,
        name: 'nftTransfer',
        status: 'pending',
        sent: [tokenTransferData],
        userOpHash: parsedUserOp.userOpHash,
        txHash: '',
        blockNumber: 0,
        description: this.generateDescription({
          tokenId: parsedUserOp.targetFunction[0].arguments[2],
          to: parsedUserOp.targetFunction[0].arguments[0],
          symbol: tokenData.symbol
        })

      }
    } catch (error) {
      throw new Error(error)
    }
  }
}

class ApproveToken extends WalletAction {
  descGenerator (data: any) {
    return `${data.action} ${data.valueInWei / Math.pow(10, data.decimals)} ${data.symbol}`
  }

  async execute (parsedUserOp: any) {
    try {
      const tokenData = await fetchTokenDetails(parsedUserOp.walletFunction.arguments[0])
      const tokenTransferData: ERC20TransferInterface = {
        type: tokenData.decimals === 0 ? ERC_721_TYPE : ERC_20_TYPE,
        name: tokenData.name,
        symbol: tokenData.symbol,
        decimals: tokenData.decimals,
        address: parsedUserOp.walletFunction.arguments[0],
        to: parsedUserOp.targetFunction[0].arguments[0],
        value: parsedUserOp.targetFunction[0].arguments[1]

      }
      return {
        name: 'approveToken',
        walletAddress: parsedUserOp.sender,
        status: 'pending',
        sent: [tokenTransferData],
        userOpHash: parsedUserOp.userOpHash,
        txHash: '',
        blockNumber: 0,
        description: this.generateDescription({
          action: 'Approved',
          symbol: tokenData.symbol,
          valueInWei: parsedUserOp.targetFunction[0].arguments[1],
          decimals: tokenData.decimals
        })
      }
    } catch (error) {
      throw new Error(error)
    }
  }
}

class BatchTransaction extends WalletAction {
  descGenerator (data: any) {
    return `${data.action} transferring to ${data.sent.length} recipients`
  }

  async execute (parsedUserOp: any) {
    try {
      const sent = []
      for (let i = 0; i < parsedUserOp.targetFunction.length; i++) {
        const tokenData = await fetchTokenDetails(parsedUserOp.targetFunction[i].targetAddress)
        if (tokenData.decimals === 0) {
          const tokenTransferData: ERC721TransferInterface = {
            type: ERC_721_TYPE,
            name: tokenData.name,
            symbol: tokenData.symbol,
            decimals: tokenData.decimals,
            address: parsedUserOp.targetFunction[i].targetAddress,
            to: parsedUserOp.targetFunction[0].arguments[0],
            tokenId: parsedUserOp.targetFunction[0].arguments[2],
            value: '0'
          }
          sent.push(tokenTransferData)
        } else {
          const tokenTransferData: ERC20TransferInterface = {
            type: ERC_20_TYPE,
            name: tokenData.name,
            symbol: tokenData.symbol,
            decimals: tokenData.decimals,
            address: parsedUserOp.targetFunction[i].targetAddress,
            to: parsedUserOp.targetFunction[0].arguments[0],
            value: parsedUserOp.targetFunction[0].arguments[1]
          }
          sent.push(tokenTransferData)
        }
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
class StakeTokens extends WalletAction {
  descGenerator (data: any) {
    return `${data.action} ${data.valueInWei / Math.pow(10, data.decimals)} ${data.symbol}`
  }

  async execute (parsedUserOp: any) {
    if (parsedUserOp.targetFunction[0]?.name === 'deposit') {
      const tokenTransferData: ERC20TransferInterface = {
        type: NATIVE_TOKEN_TYPE,
        name: NATIVE_FUSE_TOKEN.name,
        symbol: NATIVE_FUSE_TOKEN.symbol,
        address: NATIVE_FUSE_TOKEN.address,
        decimals: NATIVE_FUSE_TOKEN.decimals,
        value: parsedUserOp.walletFunction.arguments[1],
        to: parsedUserOp.walletFunction.arguments[0]
      }
      return {
        name: 'stakeTokens',
        walletAddress: parsedUserOp.sender,
        status: 'pending',
        sent: [tokenTransferData],
        userOpHash: parsedUserOp.userOpHash,
        txHash: '',
        blockNumber: 0,
        description: this.generateDescription({
          action: 'Staked',
          symbol: NATIVE_FUSE_TOKEN.symbol,
          decimals: NATIVE_FUSE_TOKEN.decimals,
          valueInWei: parsedUserOp.walletFunction.arguments[1]
        })
      }
    }
    if (parsedUserOp.targetFunction[0]?.name === 'approve') {
      try {
        const tokenData = await fetchTokenDetails(parsedUserOp.targetFunction[0].targetAddress)
        const tokenTransferData: ERC20TransferInterface = {
          type: ERC_20_TYPE,
          name: tokenData.name,
          symbol: tokenData.symbol,
          decimals: tokenData.decimals,
          address: parsedUserOp.targetFunction[0].targetAddress,
          value: parsedUserOp.targetFunction[0].arguments[1],
          to: parsedUserOp.targetFunction[1].targetAddress
        }
        return {
          name: 'stakeTokens',
          walletAddress: parsedUserOp.sender,
          status: 'pending',
          sent: [tokenTransferData],
          userOpHash: parsedUserOp.userOpHash,
          txHash: '',
          blockNumber: 0,
          description: this.generateDescription({
            action: 'Staked',
            symbol: tokenData.symbol,
            decimals: tokenData.decimals,
            valueInWei: parsedUserOp.targetFunction[0].arguments[1]
          })
        }
      } catch (error) {
        throw new Error(error)
      }
    }
  }
}

class UnstakeTokens extends WalletAction {
  descGenerator (data: any) {
    return `${data.action} ${data.valueInWei / Math.pow(10, data.decimals)} ${data.symbol}`
  }

  async execute (parsedUserOp: any) {
    if (parsedUserOp.targetFunction[0].name === 'leave') {
      try {
        const tokenData = await fetchTokenDetails(parsedUserOp.walletFunction.arguments[0])
        const sentTokenData: ERC20TransferInterface = {
          name: tokenData.name,
          symbol: tokenData.symbol,
          address: parsedUserOp.walletFunction.arguments[0],
          decimals: tokenData.decimals,
          to: LIQUID_STAKING_POOL,
          type: ERC_20_TYPE,
          value: parsedUserOp.targetFunction[0].arguments[0]
        }

        const recTokenData = await fetchTokenDetails('0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4')
        const receivedTokenData: ERC20TransferInterface = {
          name: recTokenData.name,
          symbol: recTokenData.symbol,
          address: '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4',
          decimals: recTokenData.decimals,
          to: parsedUserOp.sender,
          type: ERC_20_TYPE,
          value: parsedUserOp.targetFunction[0].arguments[0]
        }

        return {
          name: 'unstakeTokens',
          walletAddress: parsedUserOp.sender,
          status: 'pending',
          received: [receivedTokenData],
          sent: [sentTokenData],
          userOpHash: parsedUserOp.userOpHash,
          txHash: '',
          blockNumber: 0,
          description: this.generateDescription({
            action: 'Unstaked',
            symbol: receivedTokenData.symbol,
            decimals: receivedTokenData.decimals,
            valueInWei: receivedTokenData.value
          })
        }
      } catch (error) {
        throw new Error(error)
      }
    }
    if (parsedUserOp.targetFunction[0]?.name === 'approve' &&
      parsedUserOp.targetFunction[1]?.name === 'withdraw' &&
      parsedUserOp.walletFunction.name === 'executeBatch') {
      const receivedTokenData: ERC20TransferInterface = {
        name: NATIVE_FUSE_TOKEN.name,
        symbol: NATIVE_FUSE_TOKEN.symbol,
        address: NATIVE_FUSE_TOKEN.address,
        decimals: NATIVE_FUSE_TOKEN.decimals,
        to: parsedUserOp.sender,
        type: NATIVE_TOKEN_TYPE,
        value: parsedUserOp.targetFunction[0].arguments[1]
      }
      try {
        const tokenData = await fetchTokenDetails(parsedUserOp.walletFunction.arguments[0][0])
        const sentTokenData: ERC20TransferInterface = {
          name: tokenData.name,
          symbol: tokenData.symbol,
          address: parsedUserOp.walletFunction.arguments[0][0],
          decimals: tokenData.decimals,
          to: LIQUID_STAKING_POOL,
          type: ERC_20_TYPE,
          value: parsedUserOp.targetFunction[0].arguments[1]
        }
        return {
          name: 'unstakeTokens',
          walletAddress: parsedUserOp.sender,
          status: 'pending',
          received: [receivedTokenData],
          sent: [sentTokenData],
          userOpHash: parsedUserOp.userOpHash,
          txHash: '',
          blockNumber: 0,
          description: this.generateDescription({
            action: 'Unstaked',
            symbol: receivedTokenData.symbol,
            decimals: receivedTokenData.decimals,
            valueInWei: receivedTokenData.value
          })
        }
      } catch (error) {
        throw new Error(error)
      }
    }
  }
}

class SwapTokens extends WalletAction {
  descGenerator (data: any) {
    const sentValue = data.sentTokenValueInWei / Math.pow(10, data.sentTokenDecimals)
    const recValue = data.recTokenValueInWei / Math.pow(10, data.recTokenDecimals)
    return `${sentValue} ${data.sentToken} was swapped to ${recValue} ${data.recToken}`
  }

  async execute (parsedUserOp: any) {
    try {
      if (parsedUserOp.targetFunction[0]?.name === 'swapExactETHForTokens' || parsedUserOp.targetFunction[0]?.name === 'swapETHForExactTokens') {
        const tokenData = await fetchTokenDetails(parsedUserOp.targetFunction[0].arguments[1][1])
        const receivedTokenData: ERC20TransferInterface = {
          type: ERC_20_TYPE,
          name: tokenData.name,
          symbol: tokenData.symbol,
          decimals: tokenData.decimals,
          address: parsedUserOp.targetFunction[0].arguments[1][1],
          value: parsedUserOp.targetFunction[0].arguments[3],
          to: parsedUserOp.sender
        }
        const sentTokenData: ERC20TransferInterface =
        {
          type: NATIVE_TOKEN_TYPE,
          name: NATIVE_FUSE_TOKEN.name,
          symbol: NATIVE_FUSE_TOKEN.symbol,
          address: NATIVE_FUSE_TOKEN.address,
          decimals: NATIVE_FUSE_TOKEN.decimals,
          to: parsedUserOp.walletFunction.arguments[0],
          value: parsedUserOp.walletFunction.arguments[1]
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
            sentToken: NATIVE_FUSE_TOKEN.symbol,
            sentTokenDecimals: NATIVE_FUSE_TOKEN.decimals,
            sentTokenValueInWei: parsedUserOp.walletFunction.arguments[1],
            recToken: receivedTokenData.symbol,
            recTokenDecimals: receivedTokenData.decimals,
            recTokenValueInWei: parsedUserOp.targetFunction[0].arguments[3]
          })
        }
      }
      if (parsedUserOp.targetFunction[1]?.name === 'swapTokensForExactETH' || parsedUserOp.targetFunction[1]?.name === 'swapExactTokensForETH') {
        const tokenData = await fetchTokenDetails(parsedUserOp.targetFunction[1].arguments[2][0])
        const sentTokenData: ERC20TransferInterface =
        {
          type: ERC_20_TYPE,
          name: tokenData.name,
          symbol: tokenData.symbol,
          decimals: tokenData.decimals,
          address: parsedUserOp.targetFunction[1].arguments[2][0],
          to: parsedUserOp.targetFunction[1].arguments[2][1],
          value: parsedUserOp.targetFunction[1].arguments[0]
        }

        const receivedTokenData: ERC20TransferInterface =
        {
          type: NATIVE_TOKEN_TYPE,
          name: NATIVE_FUSE_TOKEN.name,
          symbol: NATIVE_FUSE_TOKEN.symbol,
          address: NATIVE_FUSE_TOKEN.address,
          decimals: NATIVE_FUSE_TOKEN.decimals,
          value: parsedUserOp.targetFunction[1].arguments[1],
          to: parsedUserOp.sender
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
            sentTokenValueInWei: parsedUserOp.targetFunction[1].arguments[0],
            recToken: NATIVE_FUSE_TOKEN.symbol,
            recTokenDecimals: NATIVE_FUSE_TOKEN.decimals,
            recTokenValueInWei: parsedUserOp.targetFunction[1].arguments[1]
          })
        }
      }
      if (parsedUserOp.targetFunction[0]?.name === 'approve' && parsedUserOp.targetFunction[1]?.name === 'swapExactTokensForTokens' || parsedUserOp.targetFunction[1]?.name === 'swapTokensForExactTokens' && parsedUserOp.walletFunction.name === 'executeBatch') {
        const sentTokenData = await fetchTokenDetails(parsedUserOp.targetFunction[0].targetAddress)
        const sentTokenDetails: ERC20TransferInterface =
        {
          type: ERC_20_TYPE,
          name: sentTokenData.name,
          symbol: sentTokenData.symbol,
          decimals: sentTokenData.decimals,
          address: parsedUserOp.targetFunction[0].targetAddress,
          to: parsedUserOp.targetFunction[0].arguments[0],
          value: parsedUserOp.targetFunction[0].arguments[1]
        }
        const receivedTokenData = await fetchTokenDetails(parsedUserOp.targetFunction[1].arguments[2][parsedUserOp.targetFunction[1].arguments[2].length - 1])
        const receivedTokenDetails: ERC20TransferInterface =
        {
          type: ERC_20_TYPE,
          name: receivedTokenData.name,
          symbol: receivedTokenData.symbol,
          decimals: receivedTokenData.decimals,
          address: parsedUserOp.targetFunction[1].arguments[2][parsedUserOp.targetFunction[1].arguments[2].length - 1],
          value: parsedUserOp.targetFunction[1].arguments[1],
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
            sentTokenValueInWei: parsedUserOp.targetFunction[0].arguments[1],
            recToken: receivedTokenData.symbol,
            recTokenDecimals: receivedTokenData.decimals,
            recTokenValueInWei: parsedUserOp.targetFunction[1].arguments[1]
          })
        }
      }
    } catch (error) {
      throw new Error(error)
    }
  }
}

// Define other sealed classes for different operation types in a similar manner
// Factory function to determine the type of operation
function getWalletActionType (parsedUserOp: any): WalletAction {
  try {
    if (parsedUserOp.targetFunction.name === 'nativeTokenTransfer') {
      return new NativeTokenTransfer()
    }
    if (
      parsedUserOp.targetFunction[0]?.name === 'transfer' &&
      parsedUserOp.walletFunction.name === 'execute'
    ) {
      return new ERC20Transfer()
    }
    if (
      parsedUserOp.targetFunction[0]?.name === 'transferFrom' &&
      parsedUserOp.walletFunction.name === 'execute'
    ) {
      return new NftTransfer()
    }
    if (
      parsedUserOp.targetFunction[0]?.name === 'approve' &&
      parsedUserOp.walletFunction.name === 'execute'
    ) {
      return new ApproveToken()
    }
    if (
      parsedUserOp.targetFunction[0]?.name === 'deposit' &&
      parsedUserOp.walletFunction.name === 'execute'
    ) {
      return new StakeTokens()
    }
    if (
      parsedUserOp.targetFunction[0]?.name === 'approve' &&
      parsedUserOp.targetFunction[1]?.name === 'enter' &&
      parsedUserOp.walletFunction.name === 'executeBatch'
    ) {
      return new StakeTokens()
    }
    if (
      parsedUserOp.targetFunction[0]?.name === 'approve' &&
      parsedUserOp.targetFunction[1]?.name === 'leave' &&
      parsedUserOp.walletFunction.name === 'executeBatch'
    ) {
      return new UnstakeTokens()
    }
    if (
      parsedUserOp.targetFunction[0]?.name === 'leave' &&
      parsedUserOp.walletFunction.name === 'execute'
    ) {
      return new UnstakeTokens()
    }
    if (
      parsedUserOp.targetFunction[0]?.name === 'approve' &&
      parsedUserOp.targetFunction[1]?.name === 'withdraw' &&
      parsedUserOp.walletFunction.name === 'executeBatch'
    ) {
      return new UnstakeTokens()
    }
    if (
      (parsedUserOp.targetFunction[0]?.name === 'approve' &&
        parsedUserOp.targetFunction[1]?.name === 'swapExactTokensForTokens') ||
      parsedUserOp.targetFunction[1]?.name === 'swapTokensForExactTokens' &&
      parsedUserOp.walletFunction.name === 'executeBatch'
    ) {
      return new SwapTokens()
    }
    if (
      (parsedUserOp.targetFunction[0]?.name === 'swapExactETHForTokens' ||
        parsedUserOp.targetFunction[0]?.name === 'swapETHForExactTokens') &&
      parsedUserOp.walletFunction.name === 'execute'
    ) {
      return new SwapTokens()
    }
    if (
      (parsedUserOp.targetFunction[1]?.name === 'swapTokensForExactETH' ||
        parsedUserOp.targetFunction[1]?.name === 'swapExactTokensForETH') &&
      parsedUserOp.walletFunction.name === 'executeBatch'
    ) {
      return new SwapTokens()
    }
    if (
      parsedUserOp.walletFunction.name === 'executeBatch'
    ) {
      return new BatchTransaction()
    }
    // If none of the conditions match, return a default class or throw an error.
    throw new Error('Unsupported operation type')
  } catch (error) {
    throw new Error(error)
  }
}

export async function parsedUserOpToWalletAction (parsedUserOp: any) {
  const actionType = await getWalletActionType(parsedUserOp)
  return await actionType.execute(parsedUserOp)
}

export function confirmedUserOpToWalletAction (userOp: any) {
  return {
    userOpHash: userOp.userOpHash,
    txHash: userOp.txHash,
    status: userOp.success ? 'success' : 'failed',
    blockNumber: userOp.blockNumber
  }
}
