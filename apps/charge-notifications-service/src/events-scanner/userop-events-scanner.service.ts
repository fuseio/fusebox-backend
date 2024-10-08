import { logPerformance } from '@app/notifications-service/common/decorators/log-performance.decorator'
import { parseLog } from '@app/notifications-service/common/utils/helper-functions'
import { UserOpScannerStatusServiceString, userOpLogsFilterString } from '@app/notifications-service/events-scanner/events-scanner.constants'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BaseProvider, InjectEthersProvider, Log } from 'nestjs-ethers'
import { UserOpEventData } from '@app/notifications-service/common/interfaces/event-data.interface'
import { EventsScannerService } from '@app/notifications-service/events-scanner/events-scanner.service'
import { ScannerStatusService } from '@app/notifications-service/common/scanner-status.service'
import { LogFilter } from '@app/notifications-service/events-scanner/interfaces/logs-filter'
import ENTRY_POINT_ABI from '@app/notifications-service/common/constants/abi/entryPoint.json'
import { smartWalletsService } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'
import { GasService } from '@app/common/services/gas.service'

@Injectable()
export class UserOpEventsScannerService extends EventsScannerService {
  constructor (
    configService: ConfigService,
    @Inject(UserOpScannerStatusServiceString)
    scannerStatusService: ScannerStatusService,
    @Inject(userOpLogsFilterString)
    logsFilter: LogFilter,
    @Inject(smartWalletsService)
    private readonly dataLayerClient: ClientProxy,
    @InjectEthersProvider('regular-node')
    rpcProvider: BaseProvider,
    private gasService: GasService
  ) {
    super(configService, scannerStatusService, logsFilter, rpcProvider, new Logger(UserOpEventsScannerService.name))
  }

  @logPerformance('UserOpEventsScannerService::ProcessBlocks')
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

  @logPerformance('UserOpEventsScannerService::ProcessEvent')
  async processEvent (log: Log) {
    const parsedLog = parseLog(log, ENTRY_POINT_ABI)
    const gasValues = await this.gasService.fetchTransactionGasCosts(
      parsedLog.transactionHash,
      this.rpcProvider
    )

    const eventData: UserOpEventData = {
      blockNumber: log.blockNumber,
      blockHash: log.blockHash,
      txHash: parsedLog.transactionHash,
      userOpHash: parsedLog.args[0],
      from: parsedLog.args[1],
      nonce: parsedLog.args[3].toString(),
      success: parsedLog.args[4],
      actualGasCost: parsedLog.args[5].toString(),
      actualGasUsed: parsedLog.args[6].toString(),
      ...gasValues
    }
    try {
      callMSFunction(this.dataLayerClient, 'update-user-op', eventData).catch((error) => {
        this.logger.error(`Failed to call update-user-op: ${error.message}`)
      })
    } catch (error) {
      this.logger.error(`Failed to call update-user-op: ${error.message}`)
    }
  }
}
