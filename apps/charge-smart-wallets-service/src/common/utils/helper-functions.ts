import { BigNumber, randomBytes } from 'nestjs-ethers'
import { createHash } from 'crypto'
import { NATIVE_FUSE_ADDRESS } from '@app/notifications-service/common/constants/addresses'
import { fetchERC20Data, fetchNftData } from '@app/smart-wallets-service/common/utils/token'
const randomInteger = (
  min: number,
  max: number
): number => Math.floor(Math.random() * (max - min + 1)) + min

export function generateSalt() {
  return BigNumber.from(randomBytes(32)).toHexString()
}

export function generateTransactionId(data) {
  return `0x${createHash('sha256').update(data + Date.now() + randomInteger(1, 1000)).digest('hex')}`
}

export async function parsedUserOpToWalletAction(parsedUserOp: any) {
  if (parsedUserOp.targetFunction.name === 'nativeTokenTransfer') {
    return {
      walletAddress: parsedUserOp.sender,
      name: 'nativeTokenTransfer',
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
  if (parsedUserOp.targetFunction[0]?.name === 'transfer' && parsedUserOp.walletFunction.name === 'execute') {
    const tokenData = await fetchERC20Data(parsedUserOp.walletFunction.arguments[0])
    return {
      walletAddress: parsedUserOp.sender,
      name: 'erc20Transfer',
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
  }
  if (parsedUserOp.targetFunction[0]?.name === 'transferFrom' && parsedUserOp.walletFunction.name === 'execute') {
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
  }
  if (parsedUserOp.targetFunction[0]?.name === 'approve' && parsedUserOp.walletFunction.name === 'execute') {
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
  }
  if (parsedUserOp.targetFunction[0]?.name === 'deposit' && parsedUserOp.walletFunction.name === 'execute') {
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
  if (parsedUserOp.targetFunction[0]?.name === 'approve' && parsedUserOp.targetFunction[1]?.name === 'enter' && parsedUserOp.walletFunction.name === 'executeBatch') {
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
  }
  if (parsedUserOp.targetFunction[0]?.name === 'approve' && parsedUserOp.targetFunction[1]?.name === 'leave' && parsedUserOp.walletFunction.name === 'executeBatch') {
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
  }
  if (parsedUserOp.targetFunction[1]?.name === 'leave' && parsedUserOp.walletFunction.name === 'execute') {
    const tokenData = await fetchERC20Data(parsedUserOp.walletFunction.arguments[0][0])
    return {
      name: 'unstakeTokens',
      walletAddress: parsedUserOp.sender,
      status: 'pending',
      received: [{
        name: tokenData.name,
        symbol: tokenData.symbol,
        decimals: tokenData.decimals,
        address: parsedUserOp.walletFunction[0][0],
        value: parsedUserOp.targetFunction[0].arguments[1]
      }],
      userOpHash: parsedUserOp.userOpHash,
      txHash: '',
      blockNumber: 0
    }
  }
  if (parsedUserOp.targetFunction[0]?.name === 'approve' && parsedUserOp.targetFunction[1]?.name === 'withdraw' && parsedUserOp.walletFunction.name === 'executeBatch') {
    const tokenData = await fetchERC20Data(parsedUserOp.targetFunction[0].targetAddress)
    return {
      name: 'unstakeTokens',
      walletAddress: parsedUserOp.sender,
      status: 'pending',
      received: [{
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
  if (parsedUserOp.targetFunction[0]?.name === 'swapExactETHForTokens' || parsedUserOp.targetFunction[0]?.name === 'swapETHForExactTokens' && parsedUserOp.walletFunction.name === 'execute') {
    const receivedTokenData = await fetchERC20Data(parsedUserOp.targetFunction[0].arguments[1][1])
    return {
      name: 'swapTokens',
      walletAddress: parsedUserOp.sender,
      status: 'pending',
      sent: [{
        name: 'FUSE',
        address: NATIVE_FUSE_ADDRESS,
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
  if (parsedUserOp.targetFunction[1]?.name === 'swapTokensForExactETH' || parsedUserOp.targetFunction[1]?.name === 'swapExactTokensForETH' && parsedUserOp.walletFunction.name === 'executeBatch') {
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
}
