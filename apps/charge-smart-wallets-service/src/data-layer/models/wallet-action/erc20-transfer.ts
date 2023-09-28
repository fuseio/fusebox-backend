import { ERC_20_TYPE } from '@app/smart-wallets-service/common/constants/tokenTypes'
import WalletAction from './base'
import { fetchTokenDetails } from '@app/smart-wallets-service/common/utils/token'
import { ERC20Transfer as IERC20Transfer } from '../../interfaces/token-interfaces'

export default class ERC20Transfer extends WalletAction {
  async constructTokenTransferData ({ callData, targetAddress }) {
    const [to, value] = callData
    const tokenDetails = await fetchTokenDetails(targetAddress)
    return {
      ...tokenDetails,
      type: ERC_20_TYPE,
      to,
      value: value.toString()
    } as IERC20Transfer
  }

  constructResponse (parsedUserOp, tokenTransferData) {
    const { sender: walletAddress, userOpHash } = parsedUserOp
    const { symbol, decimals, value } = tokenTransferData
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
        valueInWei: value,
        decimals
      })
    }
  }

  async execute (parsedUserOp) {
    const targetFunction = parsedUserOp.targetFunctions[0]
    const tokenTransferData = await this.constructTokenTransferData(targetFunction)
    return this.constructResponse(parsedUserOp, tokenTransferData)
  }
}
