import { logPerformance } from '@app/notifications-service/common/decorators/log-performance.decorator'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BaseProvider, Log } from 'nestjs-ethers'
import { ScannerService } from '@app/notifications-service/common/scanner-service'
import { ScannerStatusService } from '@app/notifications-service/common/scanner-status.service'
import { LogFilter } from './interfaces/logs-filter'
@Injectable()
export abstract class EventsScannerService extends ScannerService {
  // TODO: Create a Base class for events scanner and transaction scanner services

  constructor (
    configService: ConfigService,
    scannerStatusService: ScannerStatusService,
    private readonly logsFilter: LogFilter,
    rpcProvider: BaseProvider,
    logger: Logger
  ) {
    super(configService, scannerStatusService, rpcProvider, logger)
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
    this.logger.debug(`EventFilter: Fetching logs ${fromBlock} to ${toBlock}. topics: ${this.logsFilter.topics}, address: ${this.logsFilter.address}`)
    const logs = await this.rpcProvider.getLogs({
      fromBlock,
      toBlock,
      topics: this.logsFilter.topics,
      address: this.logsFilter.address
    })
    this.logger.debug(`EventFilter: ${logs.length} logs found`)
    return logs
  }

  abstract processEvent (log: Log);
}
