import { ERC_20_TYPE } from '@app/smart-wallets-service/common/constants/tokenTypes'
import WalletAction from '@app/smart-wallets-service/data-layer/models/wallet-action/base'
import { ERC20Transfer as IERC20Transfer } from '@app/smart-wallets-service/data-layer/interfaces/token-interfaces'

export default class ERC20Transfer extends WalletAction {
  async constructTokenTransferData ({ callData, targetAddress }) {
    const [to, value] = callData
    const tokenDetails = await this.tokenService.fetchTokenDetails(targetAddress)

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
