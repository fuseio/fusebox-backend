import { UserOp } from '@app/smart-wallets-service/data-layer/interfaces/user-op.interface'
import {
  WalletAction,
  NativeTransfer,
  ERC20Transfer,
  ApproveToken,
  UnstakeTokens,
  StakeTokens,
  NftTransfer,
  TokenSwapExecutor,
  BatchTransaction
} from '@app/smart-wallets-service/data-layer/models/wallet-action'

import { TokenReceive } from '@app/smart-wallets-service/data-layer/models/wallet-action/token-receive'
import { TokenService } from '@app/smart-wallets-service/common/services/token.service'

const singleActionMap = {
  nativeTransfer: NativeTransfer,
  transfer: ERC20Transfer,
  approve: ApproveToken,
  leave: UnstakeTokens,
  safeTransferFrom: NftTransfer,
  transferFrom: NftTransfer,
  tokenReceive: TokenReceive
}

const targetActionMap = {

  '0xeca6055ac01e717cef70b8c6fc5f9ca32cb4118a': {
    transformERC20: TokenSwapExecutor
  },
  '0x0be9e53fd7edac9f859882afdda116645287c629': {
    withdraw: TokenSwapExecutor,
    deposit: TokenSwapExecutor
  },
  '0xa3dc222ec847aac61fb6910496295bf344ea46be': {
    deposit: StakeTokens,
    withdraw: (name) => name === 'approve' ? UnstakeTokens : TokenSwapExecutor
  },
  '0x97a6e78c9208c21afada67e7e61d7ad27688efd1': {
    leave: UnstakeTokens,
    enter: StakeTokens
  }
}

function executeSingleAction (name: string, targetAddress: string) {
  const addressActionMap = targetActionMap[targetAddress.toLowerCase()]
  const ActionClass = addressActionMap?.[name] || singleActionMap[name]
  return ActionClass ? new ActionClass() : null
}

function executeBatchAction (targetFunctions) {
  if (targetFunctions.length === 2) {
    const [firstCall, lastCall] = targetFunctions
    const lastCallAddressMap = targetActionMap[lastCall.targetAddress.toLowerCase()]

    // Check if it's a specific action like swap
    if (lastCallAddressMap) {
      const ActionClass = lastCallAddressMap[lastCall.name]
      if (ActionClass) {
        if (ActionClass.prototype instanceof WalletAction) {
          return new ActionClass()
        } else if (typeof ActionClass === 'function') {
          return new (ActionClass(firstCall.name))()
        }
      }
    }
  }

  // If it's not a specific action or has more than 2 functions, use BatchTransaction
  return new BatchTransaction()
}

function getWalletActionType (parsedUserOp): WalletAction {
  const walletFunctionName = parsedUserOp.walletFunction.name
  const { name, targetAddress } = parsedUserOp.targetFunctions[0]
  if (walletFunctionName === 'execute') {
    return executeSingleAction(name, targetAddress)
  } else if (walletFunctionName === 'executeBatch') {
    return executeBatchAction(parsedUserOp.targetFunctions)
  }

  throw new Error('Unsupported wallet function name')
}

export async function parsedUserOpToWalletAction (
  parsedUserOp: UserOp, tokenService: TokenService
) {
  const actionType = getWalletActionType(parsedUserOp)
  if (!actionType) {
    throw new Error('Unsupported action')
  }
  actionType.setTokenService(tokenService)
  return actionType.execute(parsedUserOp)
}

export function confirmedUserOpToWalletAction (userOp: any) {
  return {
    userOpHash: userOp.userOpHash,
    txHash: userOp.txHash,
    status: userOp.success ? 'success' : 'failed',
    blockNumber: userOp.blockNumber
  }
}

export function tokenReceiveToWalletAction (
  fromWalletAddress: string,
  toWalletAddress: string,
  txHash: string,
  value: string,
  tokenType: string,
  { name, symbol, address, decimals },
  blockNumber: number,
  tokenId?: number
) {
  const action =
    executeSingleAction('tokenReceive', toWalletAddress) as TokenReceive

  const result = action.executeReceiveAction(
    fromWalletAddress,
    toWalletAddress,
    txHash,
    value,
    tokenType,
    { name, symbol, address, decimals },
    blockNumber,
    tokenId
  )

  return result
}
