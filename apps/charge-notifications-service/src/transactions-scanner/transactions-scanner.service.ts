import { NATIVE_FUSE_ADDRESS } from '@app/notifications-service/common/constants/addresses'
import { TokenType } from '@app/notifications-service/common/constants/token-types'
import { logPerformance } from '@app/notifications-service/common/decorators/log-performance.decorator'
import { sleep } from '@app/notifications-service/common/utils/helper-functions'
import { TransactionsScannerStatus } from '@app/notifications-service/transactions-scanner/interfaces/transactions-scaner-status.interface'
import { transactionsScannerStatusModelString } from '@app/notifications-service/transactions-scanner/transactions-scanner.constants'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { isEmpty } from 'lodash'
import { Model } from 'mongoose'
import { BigNumber, InjectEthersProvider, JsonRpcProvider, formatEther } from 'nestjs-ethers'
import { EventData } from '@app/notifications-service/common/interfaces/event-data.interface'
import { WebhooksService } from '@app/notifications-service/webhooks/webhooks.service'

@Injectable()
export class TransactionsScannerService {
  private readonly logger = new Logger(TransactionsScannerService.name)

  constructor (
        @Inject(transactionsScannerStatusModelString)
        private transactionsScannerStatusModel: Model<TransactionsScannerStatus>,
        @InjectEthersProvider('full-archive-node')
        private readonly rpcProvider: JsonRpcProvider,
        private readonly web3ProviderService: Web3ProviderService,
        private configService: ConfigService,
        private webhooksService: WebhooksService
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

        const maxBlocksToProcess = this.configService.get('rpcConfig').rpc.maxBlocksToProcess

        if (fromBlockNumber >= toBlockNumber) {
          const timeout: number = this.configService.get('rpcConfig').timeoutInterval

          await sleep(timeout)
        } else if (toBlockNumber - fromBlockNumber > maxBlocksToProcess) {
          toBlockNumber = fromBlockNumber + maxBlocksToProcess
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
      await this.processBlockTraces(i)
      await this.updateStatus('transactions', i)
    }
  }

  @logPerformance('TransactionsScanner::ProcessTraces')
  async processBlockTraces (blockNumber: number) {
    const blockHash = BigNumber.from(blockNumber).toHexString()
    const blockTraces = await this.rpcProvider.send('trace_block', [blockHash])

    if (!isEmpty(blockTraces)) {
      const filteredBlockTraces = blockTraces.filter(
        (blockTrace) => blockTrace.action.callType === 'call' &&
        BigNumber.from(blockTrace.action.value).gt(0))

      for (const trace of filteredBlockTraces) {
        try {
          await this.processTrace(trace)
        } catch (error) {
          this.logger.error('Failed to process transaction:')
          this.logger.error({ trace })
          this.logger.error(error)
        }
      }
    }
  }

  @logPerformance('TransactionsScanner::ProcessTrace')
  async processTrace (trace: any) {
    const eventData: EventData = {
      to: this.web3Provider.utils.toChecksumAddress(trace.action.to),
      from: this.web3Provider.utils.toChecksumAddress(trace.action.from),
      value: BigNumber.from(trace.action.value).toString(),
      valueEth: formatEther(BigNumber.from(trace.action.value)),
      txHash: trace.transactionHash,
      blockNumber: trace.blockNumber,
      blockHash: trace.blockHash,
      tokenType: TokenType.FUSE,
      tokenAddress: NATIVE_FUSE_ADDRESS,
      isInternalTransaction: false,
      tokenName: 'FUSE',
      tokenSymbol: 'FUSE',
      tokenDecimals: 18,
      tokenId: null
    }

    if (trace.subtraces > 0 || trace.traceAddress.length > 0) {
      eventData.isInternalTransaction = true
    }

    await this.webhooksService.processWebhookEvents(eventData)
  }
}
