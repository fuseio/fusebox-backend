import { BigNumber, randomBytes } from 'nestjs-ethers'
import { createHash } from 'crypto'

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

export function parsedUserOpToWalletAction(parsedUserOp: any) {

  if (parsedUserOp.targetFunction.name === 'nativeTokenTransfer') {
    return {
      name: 'nativeTokenTransfer',
      walletAddress: parsedUserOp.sender,
      userOpHash: parsedUserOp.userOpHash,
      action: {
        to: parsedUserOp.walletFunction.arguments[0],
        amount: parsedUserOp.walletFunction.arguments[1]
      },
      status: 'pending'
    }
  }
  if (parsedUserOp.targetFunction[0]?.name === 'transfer' && parsedUserOp.walletFunction.name === 'execute') {
    return {
      name: 'erc20Transfer',
      walletAddress: parsedUserOp.sender,
      userOpHash: parsedUserOp.userOpHash,
      action: {
        tokenAddress: parsedUserOp.walletFunction.arguments[0],
        to: parsedUserOp.targetFunction[0].arguments[0],
        amount: parsedUserOp.targetFunction[0].arguments[1]
      },
      status: 'pending'
    }
  }
  if (parsedUserOp.targetFunction[0]?.name === 'approve' && parsedUserOp.walletFunction.name === 'execute') {
    return {
      name: 'approveToken',
      walletAddress: parsedUserOp.sender,
      userOpHash: parsedUserOp.userOpHash,
      action: {
        tokenAddress: parsedUserOp.walletFunction.arguments[0],
        spender: parsedUserOp.targetFunction[0].arguments[0],
        amount: parsedUserOp.targetFunction[0].arguments[1]
      },
      status: 'pending'
    }
  }
  if (parsedUserOp.targetFunction[0]?.name === 'deposit' && parsedUserOp.walletFunction.name === 'execute') {
    return {
      name: 'nativeTokenStake',
      walletAddress: parsedUserOp.sender,
      userOpHash: parsedUserOp.userOpHash,
      action: {
        tokenAddress: parsedUserOp.walletFunction.arguments[0],
        spender: parsedUserOp.targetFunction[0].arguments[0],
        amount: parsedUserOp.targetFunction[0].arguments[1]
      },
      status: 'pending'
    }
  }
}