// TODO: Implement WalletAction for batch transaction

// import { ERC_20_TYPE, ERC_721_TYPE } from '@app/smart-wallets-service/common/constants/tokenTypes'
// import WalletAction from './base'
// import { fetchTokenDetails } from '@app/smart-wallets-service/common/utils/token'

// export default class BatchTransaction extends WalletAction {
//   descGenerator (data: any) {
//     return `${data.action} transferring to ${data.sent.length} recipients`
//   }

//   async fetchAndPrepareTokenData (functionDetail: any) {
//     const tokenData = await fetchTokenDetails(functionDetail.targetAddress)
//     if (tokenData.decimals === 0) {
//       return {
//         type: ERC_721_TYPE,
//         name: tokenData.name,
//         symbol: tokenData.symbol,
//         decimals: tokenData.decimals,
//         address: functionDetail.targetAddress,
//         to: functionDetail.arguments[0],
//         tokenId: functionDetail.arguments[2],
//         value: '0'
//       }
//     } else {
//       return {
//         type: ERC_20_TYPE,
//         name: tokenData.name,
//         symbol: tokenData.symbol,
//         decimals: tokenData.decimals,
//         address: functionDetail.targetAddress,
//         to: functionDetail.arguments[0],
//         value: functionDetail.arguments[1]
//       }
//     }
//   }

//   async execute (parsedUserOp: any) {
//     try {
//       const sent = []

//       for (const functionDetail of parsedUserOp.targetFunctions) {
//         const tokenTransferData = await this.fetchAndPrepareTokenData(functionDetail)
//         sent.push(tokenTransferData)
//       }

//       return {
//         walletAddress: parsedUserOp.sender,
//         name: 'batchTransaction',
//         status: 'pending',
//         sent,
//         userOpHash: parsedUserOp.userOpHash,
//         txHash: '',
//         blockNumber: 0,
//         description: this.generateDescription({
//           action: 'Batch',
//           sent
//         })
//       }
//     } catch (error) {
//       throw new Error(error)
//     }
//   }
// }
