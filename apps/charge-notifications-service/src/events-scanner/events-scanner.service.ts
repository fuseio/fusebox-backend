import { logPerformance } from '@app/notifications-service/common/decorators/log-performance.decorator'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Model } from 'mongoose'
import { BaseProvider, InjectEthersProvider, Log, EthersContract, InjectContractProvider } from 'nestjs-ethers'
import { ScannerService } from '@app/notifications-service/common/scanner-service'
import { ScannerStatus } from '@app/notifications-service/common/interfaces/scanner-status.interface'
import { LogFilter } from '@app/notifications-service/events-scanner/interfaces/logs-filter'
@Injectable()
export abstract class EventsScannerService extends ScannerService {
  // TODO: Create a Base class for events scanner and transaction scanner services

  constructor (
    configService: ConfigService,
    eventsScannerStatusModel: Model<ScannerStatus>,
    rpcProvider: BaseProvider,
    private readonly logsFilter: LogFilter,
    logger: Logger
  ) {
    super(rpcProvider, 'events', eventsScannerStatusModel, configService, logger)
  }

  @logPerformance('EventScanner::ProcessBlocks')
  async processBlocks (fromBlock: number, toBlock: number) {
    if (fromBlock > toBlock) return

    this.logger.log(`EventFilter: Processing blocks from ${fromBlock} to ${toBlock}`)

    const logs = await this.fetchLogs(fromBlock, toBlock)

    for (const log of logs) {
      try {
        await this.processEvent(log)
      } catch (error) {
        this.logger.error('Failed to process log:')
        this.logger.error({ log })
        this.logger.error(error)
      }
    }
  }

  async fetchLogs (fromBlock: number, toBlock: number) {
    return this.rpcProvider.getLogs({
      fromBlock,
      toBlock,
      topics: this.logsFilter.topics
    })
  }

  abstract processEvent (log: Log);
}
