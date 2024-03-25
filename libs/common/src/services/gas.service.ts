import { Injectable, Logger } from '@nestjs/common'
import { JsonRpcProvider } from 'ethers'

@Injectable()
export class GasService {
  private readonly logger = new Logger(GasService.name)

  async fetchTransactionGasCosts (transactionHash: string, rpcProvider: JsonRpcProvider) {
    const [tx, txReceipt] = await Promise.all([
      rpcProvider.getTransaction(transactionHash),
      rpcProvider.getTransactionReceipt(transactionHash)
    ])

    const gasPrice = tx?.gasPrice?.toString() || '0'
    const gasUsed = txReceipt?.gasUsed?.toString() || '0'
    const gasFee = (tx?.gasPrice * txReceipt?.gasUsed).toString() || '0'
    const gasLimit = tx?.gasLimit?.toString() || '0'
    const txnValue = tx?.value?.toString() || '0'

    return {
      gasPrice,
      gasUsed,
      gasFee,
      gasLimit,
      txnValue
    }
  }
}
