// import { NATIVE_TOKEN_TYPE } from '@app/smart-wallets-service/common/constants/tokenTypes'
import { NATIVE_TOKEN_TYPE } from '../../../common/constants/tokenTypes'
import { ERC20Transfer } from '../../interfaces/token-interfaces'
import WalletAction from './base'
// import { NATIVE_FUSE_TOKEN } from '@app/smart-wallets-service/common/constants/fuseTokenInfo'
import { NATIVE_FUSE_TOKEN } from '../../../common/constants/fuseTokenInfo'

export default class NativeTransfer extends WalletAction {
  constructTokenTransferData (targetAddress, value) {
    return {
      ...NATIVE_FUSE_TOKEN,
      type: NATIVE_TOKEN_TYPE,
      value,
      to: targetAddress
    } as ERC20Transfer
  }

  constructResponse (parsedUserOp, tokenTransferData) {
    const { sender: walletAddress, userOpHash } = parsedUserOp
    const { symbol, decimals } = tokenTransferData
    return {
      walletAddress,
      name: 'tokenTransfer',
      status: 'pending',
      sent: [tokenTransferData],
      userOpHash,
      txHash: '',
      blockNumber: 0,
      description: this.generateDescription({
        action: 'Transferred',
        symbol,
        valueInWei: tokenTransferData.value,
        decimals
      })
    }
  }

  async execute (parsedUserOp) {
    const { targetAddress, value } = parsedUserOp.targetFunctions[0]
    const tokenTransferData = this.constructTokenTransferData(targetAddress, value)
    return this.constructResponse(parsedUserOp, tokenTransferData)
  }
}
