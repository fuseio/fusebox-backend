import { BroadcasterService } from '@app/notifications-service/broadcaster/broadcaster.service'
import { NATIVE_FUSE_ADDRESS } from '@app/notifications-service/common/constants/addresses'
import { TokenType } from '@app/notifications-service/common/constants/token-types'
import { logPerformance } from '@app/notifications-service/common/decorators/log-performance.decorator'
import { sleep } from '@app/notifications-service/common/utils/helper-functions'
import { TransactionsScannerStatus } from '@app/notifications-service/transactions-scanner/interfaces/transactions-scaner-status.interface'
import { transactionsScannerStatusModelString } from '@app/notifications-service/transactions-scanner/transactions-scanner.constants'
import Web3ProviderService from '@app/notifications-service/transactions-scanner/web3-provider.service'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Model } from 'mongoose'
import { BaseProvider, BigNumber, InjectEthersProvider, TransactionResponse } from 'nestjs-ethers'
import { Transaction } from 'web3-core'

@Injectable()
export class TransactionsScannerService {
  private readonly logger = new Logger(TransactionsScannerService.name)

  constructor (
        @Inject(transactionsScannerStatusModelString)
        private transactionsScannerStatusModel: Model<TransactionsScannerStatus>,
        @InjectEthersProvider()
        private readonly rpcProvider: BaseProvider,
        private readonly web3ProviderService: Web3ProviderService,
        private configService: ConfigService,
        private broadcasterService: BroadcasterService
  ) { }

  get web3Provider () {
    return this.web3ProviderService.getProvider()
  }

  async onModuleInit (): Promise<void> {
    this.start()
  }

  async start () {
    while (true) {
      try {
        let { number: toBlockNumber } = await this.rpcProvider.getBlock('latest')

        const status = await this.getStatus('transactions')
        const fromBlockNumber = status.blockNumber
          ? status.blockNumber + 1
          : toBlockNumber

        if (fromBlockNumber >= toBlockNumber) {
          const timeout: number = this.configService.get('rpcConfig').timeoutInterval

          await sleep(timeout)
        } else if (toBlockNumber - fromBlockNumber > this.configService.get('maxBlocksToProcess')) {
          toBlockNumber = fromBlockNumber + this.configService.get('maxBlocksToProcess')
        }

        await this.processBlocks(
          fromBlockNumber,
          toBlockNumber
        )

        await this.updateStatus('transactions', toBlockNumber)
      } catch (error) {
        this.logger.error(`Failed to process blocks: ${error}`)
      }
    }
  }

  async getStatus (filter: string) {
    const status = await this.transactionsScannerStatusModel.findOne({
      filter
    })

    if (status) {
      return status
    }

    const newStatus = await this.transactionsScannerStatusModel.create({
      filter
    })
    return newStatus
  }

  async updateStatus (filter: string, blockNumber: number) {
    await this.transactionsScannerStatusModel.updateOne({ filter }, { blockNumber }, { upsert: true })
  }

  @logPerformance('TransactionsScanner::ProcessBlocks')
  async processBlocks (fromBlock: number, toBlock: number) {
    if (fromBlock > toBlock) return

    this.logger.log(`TransactionsScanner: Processing blocks from ${fromBlock} to ${toBlock}`)

    for (let i = fromBlock; i <= toBlock; i++) {
      this.logger.log(`Processing block ${i}`)
      await this.processBlock(i)
      await this.updateStatus('transactions', i)
    }
  }

  @logPerformance('TransactionsScanner::ProcessBlock')
  async processBlock (blockNumber: number) {
    // const block = await this.rpcProvider.getBlockWithTransactions(blockNumber)
    const block = await this.web3Provider.eth.getBlock(blockNumber, true)

    const filteredTransactions = block.transactions.filter(
      (transaction) => BigNumber.from(transaction.value).gt(0))

    for (const transaction of filteredTransactions) {
      try {
        await this.processTransaction(transaction)
      } catch (error) {
        this.logger.error('Failed to process transaction:')
        this.logger.error({ transaction })
        this.logger.error(error)
      }
    }
  }

  @logPerformance('TransactionsScanner::ProcessEvent')
  async processTransaction (transaction: TransactionResponse | Transaction) {
    const data: Record<string, any> = {
      to: transaction.to,
      from: transaction.from,
      value: transaction.value.toString(),
      txHash: transaction.hash,
      blockNumber: transaction.blockNumber,
      blockHash: transaction.blockHash,
      tokenType: TokenType.FUSE,
      tokenAddress: NATIVE_FUSE_ADDRESS
    }

    await this.broadcasterService.broadCastEvent(data)
  }
}
