import { logPerformance } from '@app/notifications-service/common/decorators/log-performance.decorator'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BaseProvider, Log } from 'nestjs-ethers'
import { ScannerService } from '@app/notifications-service/common/scanner-service'
import { ScannerStatusService } from '@app/notifications-service/common/scanner-status.service'
import { LogFilter } from './interfaces/logs-filter'
@Injectable()
export abstract class EventsScannerService extends ScannerService {
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
    const logs = await this.rpcProvider.getLogs({
      fromBlock,
      toBlock,
      topics: this.logsFilter.topics,
      address: this.logsFilter.address
    })

    return logs
  }

  abstract processEvent (log: Log);
}
