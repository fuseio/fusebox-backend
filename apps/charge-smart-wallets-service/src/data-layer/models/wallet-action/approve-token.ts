import { ERC_20_TYPE, ERC_721_TYPE } from '@app/smart-wallets-service/common/constants/tokenTypes'
import WalletAction from '@app/smart-wallets-service/data-layer/models/wallet-action/base'
import { ERC20Transfer } from '@app/smart-wallets-service/data-layer/interfaces/token-interfaces'

export default class ApproveToken extends WalletAction {
  async constructTokenTransferData ({ callData, targetAddress }) {
    const [to, value] = callData
    const tokenData = await this.tokenService.fetchTokenDetails(targetAddress)
    const type = tokenData.decimals === 0 ? ERC_721_TYPE : ERC_20_TYPE
    return {
      type,
      ...tokenData,
      to,
      value: value.toString()
    } as ERC20Transfer
  }

  constructResponse (parsedUserOp, tokenTransferData) {
    const { sender: walletAddress, userOpHash } = parsedUserOp
    const { symbol, decimals, value } = tokenTransferData
    return {
      name: 'approveToken',
      walletAddress,
      status: 'pending',
      sent: [tokenTransferData],
      userOpHash,
      txHash: '',
      blockNumber: 0,
      description: this.generateDescription({
        action: 'Approved',
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
