import {
  WalletAction,
  NativeTokenTransfer,
  ERC20Transfer,
  ApproveToken,
  SwapTokens,
  UnstakeTokens,
  StakeTokens,
  NftTransfer
} from '@app/smart-wallets-service/data-layer/models/wallet-action'

const singleActionMap = {
  nativeTokenTransfer: NativeTokenTransfer,
  transfer: ERC20Transfer,
  approve: ApproveToken,
  leave: UnstakeTokens,
  safeTransferFrom: NftTransfer,
  transferFrom: NftTransfer
}

const targetActionMap = {
  '0xe3f85aad0c8dd7337427b9df5d0fb741d65eeeb5': {
    swapTokensForExactTokens: SwapTokens,
    swapExactTokensForTokens: SwapTokens,
    swapExactETHForTokens: SwapTokens,
    swapTokensForExactETH: SwapTokens,
    swapExactTokensForETH: SwapTokens,
    swapETHForExactTokens: SwapTokens
  },
  '0x0be9e53fd7edac9f859882afdda116645287c629': {
    withdraw: SwapTokens,
    deposit: SwapTokens
  },
  '0xa3dc222ec847aac61fb6910496295bf344ea46be': {
    deposit: StakeTokens,
    withdraw: (name) => name === 'approve' ? UnstakeTokens : SwapTokens
  },
  '0x97a6e78c9208c21afada67e7e61d7ad27688efd1': {
    leave: UnstakeTokens,
    enter: StakeTokens
  }
}

function executeSingleAction (name, targetAddress) {
  const addressActionMap = targetActionMap[targetAddress.toLowerCase()]
  const ActionClass = addressActionMap?.[name] || singleActionMap[name]
  return ActionClass ? new ActionClass() : null
}

function executeBatchAction (targetFunctions) {
  if (targetFunctions.length !== 2) {
    // TODO: support more than 2 calls
    throw new Error('Unsupported batch action')
  }

  const [firstCall, lastCall] = targetFunctions
  const addressActionMap = targetActionMap[lastCall.targetAddress.toLowerCase()]
  const ActionClass = addressActionMap?.[lastCall.name]
  return ActionClass ? new ActionClass(firstCall.name) : null
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

export async function parsedUserOpToWalletAction (parsedUserOp) {
  const actionType = getWalletActionType(parsedUserOp)
  if (!actionType) {
    throw new Error('Unsupported action')
  }

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
