import { NATIVE_FUSE_ADDRESS } from '@app/notifications-service/common/constants/addresses'
import { fetchERC20Data, fetchNftData } from '@app/smart-wallets-service/common/utils/token'

// Base class for all operations
abstract class WalletAction {
  async execute(parsedUserOp: any): Promise<any> {
    return null
  }
}

// Sealed classes for each operation type
class NativeTokenTransfer extends WalletAction {
  async execute(parsedUserOp: any) {
    return {
      walletAddress: parsedUserOp.sender,
      name: 'tokenTransfer',
      status: 'pending',
      sent: [{
        name: 'FUSE',
        address: NATIVE_FUSE_ADDRESS,
        decimals: 18,
        value: parsedUserOp.walletFunction.arguments[1],
        to: parsedUserOp.walletFunction.arguments[0]
      }],
      userOpHash: parsedUserOp.userOpHash,
      txHash: '',
      blockNumber: 0
    }
  }
}

class ERC20Transfer extends WalletAction {
  async execute(parsedUserOp: any) {
    try {
      const tokenData = await fetchERC20Data(parsedUserOp.walletFunction.arguments[0])
      return {
        walletAddress: parsedUserOp.sender,
        name: 'tokenTransfer',
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
        blockNumber: 0
      }
    } catch (error) {
      throw new Error(error);
    }
  }
}
class NftTransfer extends WalletAction {
  async execute(parsedUserOp: any) {
    try {
      const tokenData = await fetchNftData(parsedUserOp.walletFunction.arguments[0])
      return {
        walletAddress: parsedUserOp.sender,
        name: 'nftTransfer',
        status: 'pending',
        sent: [{
          name: tokenData.name,
          symbol: tokenData.symbol,
          address: parsedUserOp.walletFunction.arguments[0],
          to: parsedUserOp.targetFunction[0].arguments[0],
          value: parsedUserOp.targetFunction[0].arguments[1]
        }],
        userOpHash: parsedUserOp.userOpHash,
        txHash: '',
        blockNumber: 0
      }
    } catch (error) {
      throw new Error(error);
    }
  }
}

class ApproveToken extends WalletAction {
  async execute(parsedUserOp: any) {
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
        blockNumber: 0
      }
    } catch (error) {
      throw new Error(error);
    }
  }
}
class BatchTransaction extends WalletAction {
  async execute(parsedUserOp: any) {
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
        blockNumber: 0
      }
    } catch (error) {
      throw new Error(error);
    }

  }
}
class StakeTokens extends WalletAction {
  async execute(parsedUserOp: any) {
    if (parsedUserOp.targetFunction[0]?.name === 'deposit') {
      return {
        name: 'stakeTokens',
        walletAddress: parsedUserOp.sender,
        status: 'pending',
        sent: [{
          name: 'FUSE',
          address: NATIVE_FUSE_ADDRESS,
          decimals: 18,
          value: parsedUserOp.walletFunction.arguments[1]
        }],
        userOpHash: parsedUserOp.userOpHash,
        txHash: '',
        blockNumber: 0
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
            name: tokenData.name,
            symbol: tokenData.symbol,
            decimals: tokenData.decimals,
            address: parsedUserOp.targetFunction[0].targetAddress,
            value: parsedUserOp.targetFunction[0].arguments[1]
          }],
          userOpHash: parsedUserOp.userOpHash,
          txHash: '',
          blockNumber: 0
        }
      } catch (error) {
        throw new Error(error);
      }
    }
  }
}

class UnstakeTokens extends WalletAction {
  async execute(parsedUserOp: any) {
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
        blockNumber: 0
      }
    } catch (error) {
      throw new Error(error)
    }

  }
}

class SwapTokens extends WalletAction {
  async execute(parsedUserOp: any) {
    try {
      if (parsedUserOp.targetFunction[0]?.name === 'swapExactETHForTokens' || parsedUserOp.targetFunction[0]?.name === 'swapETHForExactTokens') {
        const receivedTokenData = await fetchERC20Data(parsedUserOp.targetFunction[0].arguments[1][1])
        return {
          name: 'swapTokens',
          walletAddress: parsedUserOp.sender,
          status: 'pending',
          sent: [{
            name: 'Fuse',
            address: NATIVE_FUSE_ADDRESS,
            symbol: 'FUSE',
            decimals: 18,
            to: parsedUserOp.walletFunction.arguments[0],
            value: parsedUserOp.walletFunction.arguments[1]
          }],
          received: [{
            name: receivedTokenData.name,
            symbol: receivedTokenData.symbol,
            decimals: receivedTokenData.decimals,
            address: parsedUserOp.targetFunction[0].arguments[1][1],
            value: parsedUserOp.targetFunction[0].arguments[3]
          }],
          userOpHash: parsedUserOp.userOpHash,
          txHash: '',
          blockNumber: 0
        }
      }
      if (parsedUserOp.targetFunction[1]?.name === 'swapTokensForExactETH' || parsedUserOp.targetFunction[1]?.name === 'swapExactTokensForETH') {
        const sentTokenData = await fetchERC20Data(parsedUserOp.targetFunction[1].arguments[2][0])
        return {
          name: 'swapTokens',
          walletAddress: parsedUserOp.sender,
          status: 'pending',
          sent: [{
            name: sentTokenData.name,
            symbol: sentTokenData.symbol,
            decimals: sentTokenData.decimals,
            address: parsedUserOp.targetFunction[1].arguments[2][0],
            to: parsedUserOp.targetFunction[1].arguments[2][1],
            value: parsedUserOp.targetFunction[1].arguments[0]
          }],
          received: [{
            name: 'FUSE',
            address: NATIVE_FUSE_ADDRESS,
            value: parsedUserOp.targetFunction[1].arguments[1]
          }],
          userOpHash: parsedUserOp.userOpHash,
          txHash: '',
          blockNumber: 0
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
            name: sentTokenData.name,
            symbol: sentTokenData.symbol,
            decimals: sentTokenData.decimals,
            address: parsedUserOp.targetFunction[0].targetAddress,
            to: parsedUserOp.targetFunction[0].arguments[0],
            value: parsedUserOp.targetFunction[0].arguments[1]
          }],
          received: [{
            name: receivedTokenData.name,
            symbol: receivedTokenData.symbol,
            decimals: receivedTokenData.decimals,
            address: parsedUserOp.targetFunction[1].arguments[2][parsedUserOp.targetFunction[1].arguments[2].length - 1],
            value: parsedUserOp.targetFunction[1].arguments[1]
          }],
          userOpHash: parsedUserOp.userOpHash,
          txHash: '',
          blockNumber: 0
        }
      }
    } catch (error) {
      throw new Error(error)
    }
  }
}

// Define other sealed classes for different operation types in a similar manner
// Factory function to determine the type of operation
function getWalletActionType(parsedUserOp: any): WalletAction {
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

export async function parsedUserOpToWalletAction(parsedUserOp: any) {
  const actionType = await getWalletActionType(parsedUserOp)
  return await actionType.execute(parsedUserOp)
}
