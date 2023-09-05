import { NATIVE_FUSE_ADDRESS } from '@app/notifications-service/common/constants/addresses'
import { TokenType } from '@app/notifications-service/common/constants/token-types'
import { logPerformance } from '@app/notifications-service/common/decorators/log-performance.decorator'
import { ScannerStatus } from '@app/notifications-service/common/interfaces/scanner-status.interface'
import { transactionsScannerStatusModelString } from '@app/notifications-service/transactions-scanner/transactions-scanner.constants'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { isEmpty } from 'lodash'
import { Model } from 'mongoose'
import { BigNumber, InjectEthersProvider, JsonRpcProvider, formatEther } from 'nestjs-ethers'
import { EventData } from '@app/notifications-service/common/interfaces/event-data.interface'
import { WebhooksService } from '@app/notifications-service/webhooks/webhooks.service'
import { ScannerService } from '../common/scanner-service'
import { transactionsScannerStatusServiceString } from './transactions-scanner.constants';
import { ScannerStatusService } from '../common/scanner-status.service';

@Injectable()
export class TransactionsScannerService extends ScannerService {
  private readonly filter = 'transactions'

  constructor (
    configService: ConfigService,
    @Inject(transactionsScannerStatusServiceString)
    scannerStatusService: ScannerStatusService,
    @InjectEthersProvider('full-archive-node')
    readonly rpcProvider: JsonRpcProvider,
    private readonly web3ProviderService: Web3ProviderService,
    
    private webhooksService: WebhooksService
  ) { 
    super(configService, scannerStatusService, rpcProvider, new Logger(TransactionsScannerService.name))
  }

  get web3Provider () {
    return this.web3ProviderService.getProvider()
  }

  @logPerformance('TransactionsScanner::ProcessBlocks')
  async processBlocks (fromBlock: number, toBlock: number) {
    if (fromBlock > toBlock) return

    this.logger.log(`TransactionsScanner: Processing blocks from ${fromBlock} to ${toBlock}`)

    for (let i = fromBlock; i <= toBlock; i++) {
      this.logger.log(`Processing block ${i}`)
      await this.processBlockTraces(i)
      await this.scannerStatusService.updateStatus(i)
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
      tokenSymbol: 'FUSE',
      tokenAddress: NATIVE_FUSE_ADDRESS,
      isInternalTransaction: false,
      tokenName: 'FUSE',
      tokenDecimals: 18,
      tokenId: null
    }

    if (trace.subtraces > 0 || trace.traceAddress.length > 0) {
      eventData.isInternalTransaction = true
    }

    this.webhooksService.processWebhookEvents(eventData).catch((error) => {
      this.logger.error(`Failed to process webhook events for event data :${eventData} - Error: ${error}`)
    })
  }
}
