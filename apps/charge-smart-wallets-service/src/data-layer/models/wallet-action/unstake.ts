// import { ERC_20_TYPE, NATIVE_TOKEN_TYPE } from '@app/smart-wallets-service/common/constants/tokenTypes'
import { ERC_20_TYPE, NATIVE_TOKEN_TYPE } from '../../../common/constants/tokenTypes'
import WalletAction from './base'
import { ERC20Transfer } from '../../interfaces/token-interfaces'
// import { NATIVE_FUSE_TOKEN } from '@app/smart-wallets-service/common/constants/fuseTokenInfo'
import { NATIVE_FUSE_TOKEN } from '../../../common/constants/fuseTokenInfo'
// import { LIQUID_STAKING_CONTRACT_ADDRESS } from '@app/smart-wallets-service/common/constants/addresess'
import { LIQUID_STAKING_CONTRACT_ADDRESS } from '../../../common/constants/addresess'
import { first, last } from 'lodash'

export default class UnstakeTokens extends WalletAction {
  async execute (parsedUserOp: any) {
    const { name: walletFunctionName } = parsedUserOp.walletFunction
    if (walletFunctionName === 'executeBatch') {
      const firstCallData: any = first(parsedUserOp.targetFunctions)
      const lastCallData: any = last(parsedUserOp.targetFunctions)
      if (lastCallData.name === 'withdraw') {
        const { callData } = lastCallData
        const [value] = callData
        const receivedTokenData: ERC20Transfer = {
          ...NATIVE_FUSE_TOKEN,
          to: parsedUserOp.sender,
          type: NATIVE_TOKEN_TYPE,
          value: '0'
        }

        const tokenData = await this.tokenService.fetchTokenDetails(firstCallData.targetAddress)

        const sentTokenData: ERC20Transfer = {
          ...tokenData,
          to: lastCallData.targetAddress,
          type: ERC_20_TYPE,
          value: value.toString()
        }

        return {
          name: 'unstakeTokens',
          walletAddress: parsedUserOp.sender,
          status: 'pending',
          received: [receivedTokenData],
          sent: [sentTokenData],
          userOpHash: parsedUserOp.userOpHash,
          txHash: '',
          blockNumber: 0,
          description: this.generateDescription({
            action: 'Unstake',
            symbol: sentTokenData.symbol,
            decimals: sentTokenData.decimals,
            valueInWei: sentTokenData.value
          })
        }
      } else {
        const { name, targetAddress, callData } = lastCallData
        if (name === 'leave') {
          const [value] = callData
          const tokenData = await this.tokenService.fetchTokenDetails(targetAddress)
          const sentTokenData: ERC20Transfer = {
            ...tokenData,
            to: LIQUID_STAKING_CONTRACT_ADDRESS,
            type: ERC_20_TYPE,
            value: value.toString()
          }
          const recTokenData = await this.tokenService.fetchTokenDetails('0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4')
          const receivedTokenData: ERC20Transfer = {
            ...recTokenData,
            to: parsedUserOp.sender,
            type: ERC_20_TYPE,
            value: '0'
          }
          return {
            name: 'unstakeTokens',
            walletAddress: parsedUserOp.sender,
            status: 'pending',
            received: [receivedTokenData],
            sent: [sentTokenData],
            userOpHash: parsedUserOp.userOpHash,
            txHash: '',
            blockNumber: 0,
            description: this.generateDescription({
              action: 'Unstake',
              symbol: sentTokenData.symbol,
              decimals: sentTokenData.decimals,
              valueInWei: sentTokenData.value
            })
          }
        }
      }
    } else {
      const { name, targetAddress, callData } = parsedUserOp.targetFunctions[0]
      if (name === 'leave') {
        const [value] = callData
        const tokenData = await this.tokenService.fetchTokenDetails(targetAddress)
        const sentTokenData: ERC20Transfer = {
          ...tokenData,
          to: LIQUID_STAKING_CONTRACT_ADDRESS,
          type: ERC_20_TYPE,
          value: value.toString()
        }
        const recTokenData = await this.tokenService.fetchTokenDetails('0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4')
        const receivedTokenData: ERC20Transfer = {
          ...recTokenData,
          to: parsedUserOp.sender,
          type: ERC_20_TYPE,
          value: '0'
        }
        return {
          name: 'unstakeTokens',
          walletAddress: parsedUserOp.sender,
          status: 'pending',
          received: [receivedTokenData],
          sent: [sentTokenData],
          userOpHash: parsedUserOp.userOpHash,
          txHash: '',
          blockNumber: 0,
          description: this.generateDescription({
            action: 'Unstake',
            symbol: sentTokenData.symbol,
            decimals: sentTokenData.decimals,
            valueInWei: sentTokenData.value
          })
        }
      }
    }
  }
}
