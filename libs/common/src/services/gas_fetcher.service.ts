import { Injectable, Logger } from '@nestjs/common'
import { BaseProvider } from 'nestjs-ethers'

@Injectable()
export class GasValuesService {
  private readonly logger = new Logger(GasValuesService.name)

  async getTxGasValues (transactionHash: string, rpcProvider: BaseProvider) {
    const [tx, txReceipt] = await Promise.all([
      rpcProvider.getTransaction(transactionHash),
      rpcProvider.getTransactionReceipt(transactionHash)
    ])

    const gasPrice = tx?.gasPrice?.toString() || '0'
    const gasUsed = txReceipt?.gasUsed?.toString() || '0'
    const gasFee = tx?.gasPrice?.mul(txReceipt?.gasUsed)?.toString() || '0'
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
