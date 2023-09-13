import { NATIVE_FUSE_TOKEN } from '@app/smart-wallets-service/common/constants/fuseTokenInfo'
import { fetchERC20Data, fetchNftData } from '@app/smart-wallets-service/common/utils/token'
import { NATIVE_TOKEN_TYPE, ERC_20_TYPE, ERC_721_TYPE } from '@app/smart-wallets-service/common/constants/tokenTypes'
import { symbol } from 'zod'

// Base class for all operations
abstract class WalletAction {
  async execute (parsedUserOp: any): Promise<any> {
    return null
  }
}

// Sealed classes for each operation type
class NativeTokenTransfer extends WalletAction {
  async execute (parsedUserOp: any) {
    return {
      walletAddress: parsedUserOp.sender,
      name: 'tokenTransfer',
      status: 'pending',
      sent: [{
        type: NATIVE_TOKEN_TYPE,
        name: NATIVE_FUSE_TOKEN.name,
        symbol: NATIVE_FUSE_TOKEN.symbol,
        address: NATIVE_FUSE_TOKEN.address,
        decimals: NATIVE_FUSE_TOKEN.decimals,
        value: parsedUserOp.walletFunction.arguments[1],
        to: parsedUserOp.walletFunction.arguments[0]
      }],
      userOpHash: parsedUserOp.userOpHash,
      txHash: '',
      blockNumber: 0,
      description: descGenerator('Transferred',
        {
          symbol: NATIVE_FUSE_TOKEN.symbol,
          valueInWei: parsedUserOp.walletFunction.arguments[1],
          decimals: NATIVE_FUSE_TOKEN.decimals
        }
      )
    }
  }
}

class ERC20Transfer extends WalletAction {
  async execute (parsedUserOp: any) {
    try {
      const tokenData = await fetchERC20Data(parsedUserOp.walletFunction.arguments[0])
      return {
        walletAddress: parsedUserOp.sender,
        name: 'tokenTransfer',
        status: 'pending',
        sent: [{
          type: ERC_20_TYPE,
          name: tokenData.name,
          symbol: tokenData.symbol,
          decimals: tokenData.decimals,
          address: parsedUserOp.walletFunction.arguments[0],
          to: parsedUserOp.targetFunction[0].arguments[0],
          value: parsedUserOp.targetFunction[0].arguments[1]
        }],
        userOpHash: parsedUserOp.userOpHash,
        txHash: '',
        blockNumber: 0,
        description: descGenerator('Transferred',
          {
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
  async execute (parsedUserOp: any) {
    try {
      const tokenData = await fetchNftData(parsedUserOp.walletFunction.arguments[0])
      return {
        walletAddress: parsedUserOp.sender,
        name: 'nftTransfer',
        status: 'pending',
        sent: [{
          type: ERC_721_TYPE,
          name: tokenData.name,
          symbol: tokenData.symbol,
          address: parsedUserOp.walletFunction.arguments[0],
          to: parsedUserOp.targetFunction[0].arguments[0],
          tokenId: parsedUserOp.targetFunction[0].arguments[2],
          value: 0
        }],
        userOpHash: parsedUserOp.userOpHash,
        txHash: '',
        blockNumber: 0,
        description: descGenerator('nft', { symbol: tokenData.symbol })

      }
    } catch (error) {
      throw new Error(error)
    }
  }
}

class ApproveToken extends WalletAction {
  async execute (parsedUserOp: any) {
    try {
      const tokenData = await fetchERC20Data(parsedUserOp.walletFunction.arguments[0])
      return {
        name: 'approveToken',
        walletAddress: parsedUserOp.sender,
        status: 'pending',
        sent: [{
          name: tokenData.name,
          symbol: tokenData.symbol,
          decimals: tokenData.decimals,
          address: parsedUserOp.walletFunction.arguments[0],
          to: parsedUserOp.targetFunction[0].arguments[0],
          value: parsedUserOp.targetFunction[0].arguments[1]
        }],
        userOpHash: parsedUserOp.userOpHash,
        txHash: '',
        blockNumber: 0,
        description: descGenerator('Approved', {
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
  async execute (parsedUserOp: any) {
    try {
      const sent = []
      for (let i = 0; i < parsedUserOp.targetFunction.length; i++) {
        const tokenData = await fetchERC20Data(parsedUserOp.targetFunction[i].targetAddress)
        const token =
        {
          name: tokenData.name,
          symbol: tokenData.symbol,
          decimals: tokenData.decimals,
          address: parsedUserOp.targetFunction[i].targetAddress,
          to: parsedUserOp.targetFunction[0].arguments[0],
          value: parsedUserOp.targetFunction[0].arguments[1],
          targetAddress: parsedUserOp.targetFunction[i].targetAddress
        }
        sent.push(token)
      }
      return {
        walletAddress: parsedUserOp.sender,
        name: 'batchTransaction',
        status: 'pending',
        sent,
        userOpHash: parsedUserOp.userOpHash,
        txHash: '',
        blockNumber: 0,
        description: descGenerator('batch', { sent })
      }
    } catch (error) {
      throw new Error(error)
    }
  }
}
class StakeTokens extends WalletAction {
  async execute (parsedUserOp: any) {
    if (parsedUserOp.targetFunction[0]?.name === 'deposit') {
      return {
        name: 'stakeTokens',
        walletAddress: parsedUserOp.sender,
        status: 'pending',
        sent: [{
          type: NATIVE_TOKEN_TYPE,
          name: NATIVE_FUSE_TOKEN.name,
          symbol: NATIVE_FUSE_TOKEN.symbol,
          address: NATIVE_FUSE_TOKEN.address,
          decimals: NATIVE_FUSE_TOKEN.decimals,
          value: parsedUserOp.walletFunction.arguments[1]
        }],
        userOpHash: parsedUserOp.userOpHash,
        txHash: '',
        blockNumber: 0,
        description: descGenerator('Staked', {
          symbol: NATIVE_FUSE_TOKEN.symbol,
          decimals: NATIVE_FUSE_TOKEN.decimals,
          valueInWei: parsedUserOp.walletFunction.arguments[1]
        })
      }
    }
    if (parsedUserOp.targetFunction[0]?.name === 'approve') {
      try {
        const tokenData = await fetchERC20Data(parsedUserOp.targetFunction[0].targetAddress)
        return {
          name: 'stakeTokens',
          walletAddress: parsedUserOp.sender,
          status: 'pending',
          sent: [{
            type: ERC_20_TYPE,
            name: tokenData.name,
            symbol: tokenData.symbol,
            decimals: tokenData.decimals,
            address: parsedUserOp.targetFunction[0].targetAddress,
            value: parsedUserOp.targetFunction[0].arguments[1]
          }],
          userOpHash: parsedUserOp.userOpHash,
          txHash: '',
          blockNumber: 0,
          description: descGenerator('Staked', {
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
  async execute (parsedUserOp: any) {
    try {
      const tokenData = await fetchERC20Data(parsedUserOp.walletFunction.arguments[0][0])
      return {
        name: 'unstakeTokens',
        walletAddress: parsedUserOp.sender,
        status: 'pending',
        received: [{
          name: tokenData.name,
          symbol: tokenData.symbol,
          decimals: tokenData.decimals,
          address: parsedUserOp.walletFunction.arguments[0][0],
          value: parsedUserOp.targetFunction[0].arguments[1]
        }],
        userOpHash: parsedUserOp.userOpHash,
        txHash: '',
        blockNumber: 0,
        description: descGenerator('Unstaked', {
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

class SwapTokens extends WalletAction {
  async execute (parsedUserOp: any) {
    try {
      if (parsedUserOp.targetFunction[0]?.name === 'swapExactETHForTokens' || parsedUserOp.targetFunction[0]?.name === 'swapETHForExactTokens') {
        const receivedTokenData = await fetchERC20Data(parsedUserOp.targetFunction[0].arguments[1][1])
        return {
          name: 'swapTokens',
          walletAddress: parsedUserOp.sender,
          status: 'pending',
          sent: [{
            type: NATIVE_TOKEN_TYPE,
            name: NATIVE_FUSE_TOKEN.name,
            symbol: NATIVE_FUSE_TOKEN.symbol,
            address: NATIVE_FUSE_TOKEN.address,
            decimals: NATIVE_FUSE_TOKEN.decimals,
            to: parsedUserOp.walletFunction.arguments[0],
            value: parsedUserOp.walletFunction.arguments[1]
          }],
          received: [{
            type: ERC_20_TYPE,
            name: receivedTokenData.name,
            symbol: receivedTokenData.symbol,
            decimals: receivedTokenData.decimals,
            address: parsedUserOp.targetFunction[0].arguments[1][1],
            value: parsedUserOp.targetFunction[0].arguments[3]
          }],
          userOpHash: parsedUserOp.userOpHash,
          txHash: '',
          blockNumber: 0,
          description: descGenerator('swap', {
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
        const sentTokenData = await fetchERC20Data(parsedUserOp.targetFunction[1].arguments[2][0])
        return {
          name: 'swapTokens',
          walletAddress: parsedUserOp.sender,
          status: 'pending',
          sent: [{
            type: ERC_20_TYPE,
            name: sentTokenData.name,
            symbol: sentTokenData.symbol,
            decimals: sentTokenData.decimals,
            address: parsedUserOp.targetFunction[1].arguments[2][0],
            to: parsedUserOp.targetFunction[1].arguments[2][1],
            value: parsedUserOp.targetFunction[1].arguments[0]
          }],
          received: [{
            type: NATIVE_TOKEN_TYPE,
            name: NATIVE_FUSE_TOKEN.name,
            symbol: NATIVE_FUSE_TOKEN.symbol,
            address: NATIVE_FUSE_TOKEN.address,
            decimals: NATIVE_FUSE_TOKEN.decimals,
            value: parsedUserOp.targetFunction[1].arguments[1]
          }],
          userOpHash: parsedUserOp.userOpHash,
          txHash: '',
          blockNumber: 0,
          description: descGenerator('swap', {
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
        const sentTokenData = await fetchERC20Data(parsedUserOp.targetFunction[0].targetAddress)
        const receivedTokenData = await fetchERC20Data(parsedUserOp.targetFunction[1].arguments[2][parsedUserOp.targetFunction[1].arguments[2].length - 1])
        return {
          name: 'swapTokens',
          walletAddress: parsedUserOp.sender,
          status: 'pending',
          sent: [{
            type: ERC_20_TYPE,
            name: sentTokenData.name,
            symbol: sentTokenData.symbol,
            decimals: sentTokenData.decimals,
            address: parsedUserOp.targetFunction[0].targetAddress,
            to: parsedUserOp.targetFunction[0].arguments[0],
            value: parsedUserOp.targetFunction[0].arguments[1]
          }],
          received: [{
            type: ERC_20_TYPE,
            name: receivedTokenData.name,
            symbol: receivedTokenData.symbol,
            decimals: receivedTokenData.decimals,
            address: parsedUserOp.targetFunction[1].arguments[2][parsedUserOp.targetFunction[1].arguments[2].length - 1],
            value: parsedUserOp.targetFunction[1].arguments[1]
          }],
          userOpHash: parsedUserOp.userOpHash,
          txHash: '',
          blockNumber: 0,
          description: descGenerator('swap', {
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
      // Define and return the class for 'approveToken' here
    }
    if (
      parsedUserOp.targetFunction[0]?.name === 'deposit' &&
      parsedUserOp.walletFunction.name === 'execute'
    ) {
      return new StakeTokens()
      // Define and return the class for 'stakeTokens' here
    }
    if (
      parsedUserOp.targetFunction[0]?.name === 'approve' &&
      parsedUserOp.targetFunction[1]?.name === 'enter' &&
      parsedUserOp.walletFunction.name === 'executeBatch'
    ) {
      return new StakeTokens()
      // Define and return the class for 'stakeTokens' here
    }
    if (
      parsedUserOp.targetFunction[0]?.name === 'approve' &&
      parsedUserOp.targetFunction[1]?.name === 'leave' &&
      parsedUserOp.walletFunction.name === 'executeBatch'
    ) {
      return new UnstakeTokens()
      // Define and return the class for 'unstakeTokens' here
    }
    if (
      parsedUserOp.targetFunction[1]?.name === 'leave' &&
      parsedUserOp.walletFunction.name === 'execute'
    ) {
      return new UnstakeTokens()
      // Define and return the class for 'unstakeTokens' here
    }
    if (
      parsedUserOp.targetFunction[0]?.name === 'approve' &&
      parsedUserOp.targetFunction[1]?.name === 'withdraw' &&
      parsedUserOp.walletFunction.name === 'executeBatch'
    ) {
      return new UnstakeTokens()
      // Define and return the class for 'unstakeTokens' here
    }
    if (
      (parsedUserOp.targetFunction[0]?.name === 'approve' &&
        parsedUserOp.targetFunction[1]?.name === 'swapExactTokensForTokens') ||
      parsedUserOp.targetFunction[1]?.name === 'swapTokensForExactTokens' &&
      parsedUserOp.walletFunction.name === 'executeBatch'
    ) {
      return new SwapTokens()

      // Define and return the class for 'swapTokens' here
    }
    if (
      (parsedUserOp.targetFunction[0]?.name === 'swapExactETHForTokens' ||
        parsedUserOp.targetFunction[0]?.name === 'swapETHForExactTokens') &&
      parsedUserOp.walletFunction.name === 'execute'
    ) {
      return new SwapTokens()
      // Define and return the class for 'swapTokens' here
    }
    if (
      (parsedUserOp.targetFunction[1]?.name === 'swapTokensForExactETH' ||
        parsedUserOp.targetFunction[1]?.name === 'swapExactTokensForETH') &&
      parsedUserOp.walletFunction.name === 'executeBatch'
    ) {
      return new SwapTokens()
      // Define and return the class for 'swapTokens' here
    }
    if (
      parsedUserOp.walletFunction.name === 'executeBatch'
    ) {
      return new BatchTransaction()
      // Define and return the class for 'swapTokens' here
    }
    // If none of the conditions match, return a default class or throw an error.
    throw new Error('Unsupported operation type')
  } catch (error) {
    throw new Error(error)
  }
}

function descGenerator (action, data: any) {
  if (action === 'nft') {
    return `ERC-721: 1 ${data.symbol} transferred`
  }
  if (action === 'swap') {
    const sentValue = data.sentTokenValueInWei / Math.pow(10, data.sentTokenDecimals)
    const recValue = data.recTokenValueInWei / Math.pow(10, data.recTokenDecimals)
    return `${sentValue}  ${data.sentToken} was swapped to ${recValue} ${data.recToken}  `
  }
  if (action === 'batch') {
    // const description = ["Batch-transaction:"]
    // for (let i = 0; i < data.sent.length; i++) {
    //   const sentValue = data.sent[i].value / parseFloat("10".padEnd(data.sentTokenDecimals, '0'))
    //   description.push(`${sentValue} ${data.sent[i].symbol} was sent to:${data.sent[i].to}`)
    // }
    return `Batch transferring to ${data.sent.length} recipients`
  }
  const value = data.valueInWei / Math.pow(10, data.decimals)
  return `${action} ${value} ${data.symbol}`
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
