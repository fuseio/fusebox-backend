import { ERC_20_TYPE, NATIVE_TOKEN_TYPE } from '@app/smart-wallets-service/common/constants/tokenTypes'
import WalletAction from './base'
import { fetchTokenDetails } from '@app/smart-wallets-service/common/utils/token'
import { ERC20Transfer } from '../../interfaces/token-interfaces'
import { NATIVE_FUSE_TOKEN } from '@app/smart-wallets-service/common/constants/fuseTokenInfo'
import { first, last } from 'lodash'
import { ethers } from 'ethers'
import { LIQUID_STAKING_CONTRACT_ADDRESS } from '@app/smart-wallets-service/common/constants/addresess'

export default class StakeTokens extends WalletAction {
  async execute (parsedUserOp: any) {
    const { name: walletFunctionName } = parsedUserOp.walletFunction

    if (walletFunctionName === 'executeBatch') {
      return this.handleBatchExecution(parsedUserOp)
    } else {
      return this.handleSingleExecution(parsedUserOp)
    }
  }

  async handleBatchExecution (parsedUserOp: any) {
    const lastCallData: any = last(parsedUserOp.targetFunctions)
    if (lastCallData.name !== 'enter') return

    const firstCallData: any = first(parsedUserOp.targetFunctions)
    const sentTokenData = await this.getERC20TransferData(firstCallData)
    const receivedTokenData = await this.getReceivedTokenData(sentTokenData.to)

    return this.constructResponse(parsedUserOp, sentTokenData, receivedTokenData)
  }

  async handleSingleExecution (parsedUserOp) {
    const { name, value, targetAddress } = parsedUserOp.targetFunctions[0]
    if (name !== 'deposit') return

    const tokenTransferData = {
      type: NATIVE_TOKEN_TYPE,
      ...NATIVE_FUSE_TOKEN,
      value: value.toString(),
      to: targetAddress
    }

    const receivedTokenData = await this.getReceivedTokenData(LIQUID_STAKING_CONTRACT_ADDRESS)

    return this.constructResponse(parsedUserOp, tokenTransferData, receivedTokenData)
  }

  async getERC20TransferData ({ targetAddress, callData }) {
    const [to, value] = callData
    const sentTokenDetails = await fetchTokenDetails(targetAddress)
    return {
      type: ERC_20_TYPE,
      ...sentTokenDetails,
      value: value.toString(),
      to
    } as ERC20Transfer
  }

  async getReceivedTokenData (to) {
    const receiveTokenDetails = await fetchTokenDetails(to)
    return {
      type: ERC_20_TYPE,
      ...receiveTokenDetails,
      value: '0',
      from: ethers.constants.AddressZero
    } as ERC20Transfer
  }

  constructResponse (parsedUserOp, sentTokenData, receivedTokenData) {
    return {
      name: 'stakeTokens',
      walletAddress: parsedUserOp.sender,
      status: 'pending',
      sent: [sentTokenData],
      received: [receivedTokenData],
      userOpHash: parsedUserOp.userOpHash,
      txHash: '',
      blockNumber: 0,
      description: this.generateDescription({
        action: 'Staked',
        symbol: sentTokenData.symbol,
        decimals: sentTokenData.decimals,
        valueInWei: sentTokenData.value
      })
    }
  }
}
