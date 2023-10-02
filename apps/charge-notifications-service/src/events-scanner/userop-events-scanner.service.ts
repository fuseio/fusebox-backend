import { TokenType } from '@app/notifications-service/common/constants/token-types'
import { logPerformance } from '@app/notifications-service/common/decorators/log-performance.decorator'
import { parseLog } from '@app/notifications-service/common/utils/helper-functions'
import { UserOpScannerStatusServiceString, eventsScannerStatusModelString, userOpLogsFilterString } from '@app/notifications-service/events-scanner/events-scanner.constants'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BaseProvider, InjectEthersProvider, Log, Contract, EthersContract, InjectContractProvider, formatUnits } from 'nestjs-ethers'
import { UserOpEventData } from '@app/notifications-service/common/interfaces/event-data.interface'
import { WebhooksService } from '@app/notifications-service/webhooks/webhooks.service'
import { TokenInfoCache } from '@app/notifications-service/events-scanner/interfaces/token-info-cache'
import { EventsScannerService } from './events-scanner.service'
import { ScannerStatusService } from '../common/scanner-status.service'
import { LogFilter } from './interfaces/logs-filter'
import ENTRY_POINT_ABI from '@app/notifications-service/common/constants/abi/entryPoint.json'
import { smartWalletsService } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'
@Injectable()
export class UserOpEventsScannerService extends EventsScannerService {
  // TODO: Create a Base class for events scanner and transaction scanner services
  private tokenInfoCache: TokenInfoCache = {}

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
    @InjectContractProvider('regular-node')
    private readonly ethersContract: EthersContract,
    private webhooksService: WebhooksService
  ) {
    super(configService, scannerStatusService, logsFilter, rpcProvider, new Logger(UserOpEventsScannerService.name))
  }

  @logPerformance('UserOpEventsScannerService::ProcessBlocks')
  async processBlocks (fromBlock: number, toBlock: number) {
    if (fromBlock > toBlock) return

    this.logger.log(`UserOpEventsScannerService: Processing blocks from ${fromBlock} to ${toBlock}`)

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
    this.logger.log(`Processing UserOp event from block: ${log.blockNumber} & txHash:  ${log.transactionHash}`)

    const parsedLog = parseLog(log, ENTRY_POINT_ABI)
    const eventData: UserOpEventData = {
      blockNumber: log.blockNumber,
      blockHash: log.blockHash,
      txHash: parsedLog.transactionHash,
      userOpHash: parsedLog.args[0],
      from: parsedLog.args[1],
      paymasterAndData: parsedLog.args[2],
      nonce: parsedLog.args[3].toNumber(),
      success: parsedLog.args[4],
      actualGasCost: parsedLog.args[5].toNumber(),
      actualGasUsed: parsedLog.args[6].toNumber()
    }
    try {
      callMSFunction(this.dataLayerClient, 'update-user-op', eventData)
    } catch (error) {
      this.logger.error(`Failed to call update-user-op: ${error.message}`)
    }
  }
}
