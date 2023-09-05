import { TokenType } from '@app/notifications-service/common/constants/token-types'
import { logPerformance } from '@app/notifications-service/common/decorators/log-performance.decorator'
import { getTokenTypeAbi, getTransferEventTokenType, parseLog, sleep } from '@app/notifications-service/common/utils/helper-functions'
import { UserOpScannerStatusServiceString, eventsScannerStatusModelString, userOpLogsFilterString } from '@app/notifications-service/events-scanner/events-scanner.constants'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BigNumber, BaseProvider, InjectEthersProvider, Log, Contract, EthersContract, InjectContractProvider, formatUnits } from 'nestjs-ethers'
import { EventData } from '@app/notifications-service/common/interfaces/event-data.interface'
import { WebhooksService } from '@app/notifications-service/webhooks/webhooks.service'
import { TokenInfo, TokenInfoCache } from '@app/notifications-service/events-scanner/interfaces/token-info-cache'
import { has } from 'lodash'
import { EventsScannerService } from './events-scanner.service'
import { ScannerStatusService } from '../common/scanner-status.service'
import { LogFilter } from './interfaces/logs-filter'
import ENTRY_POINT_ABI from '@app/notifications-service/common/constants/abi/entryPoint.json'
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
    @InjectEthersProvider('regular-node')
    rpcProvider: BaseProvider,
    @InjectContractProvider('regular-node')
    private readonly ethersContract: EthersContract,
    private webhooksService: WebhooksService
  ) {
    super(configService, scannerStatusService, logsFilter, rpcProvider, new Logger(UserOpEventsScannerService.name))
  }

  @logPerformance('ERC20EventsScannerService::ProcessBlocks')
  async processBlocks (fromBlock: number, toBlock: number) {
    if (fromBlock > toBlock) return

    this.logger.log(`ERC20EventsScannerService: Processing blocks from ${fromBlock} to ${toBlock}`)

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

  @logPerformance('ERC20EventsScannerService::ProcessEvent')
  async processEvent (log: Log) {
    this.logger.log(`Processing event from block: ${log.blockNumber} & txHash: ${log.transactionHash}`)

    // const tokenType = getTransferEventTokenType(log)
    // const abi = getTokenTypeAbi(tokenType)

    const parsedLog = parseLog(log, ENTRY_POINT_ABI)
    const fromAddress = parsedLog.args[0]
    const toAddress = parsedLog.args[1]

    const tokenAddress = parsedLog.address

    // const eventData: EventData = {
    //   to: toAddress,
    //   from: fromAddress,
    //   txHash: parsedLog.transactionHash,
    //   tokenAddress: parsedLog.address,
    //   blockNumber: log.blockNumber,
    //   blockHash: log.blockHash,
    //   tokenType: tokenType?.valueOf(),
    //   tokenName: name,
    //   tokenSymbol: symbol,
    //   value: null,
    //   tokenDecimals: null,
    //   tokenId: null,
    //   valueEth: null,
    //   isInternalTransaction: false
    // }

    // if (tokenType === TokenType.ERC20) {
    //   eventData.value = BigNumber.from(parsedLog.args[2]).toString()
    //   eventData.tokenDecimals = decimals
    //   eventData.valueEth = formatUnits(eventData.value, eventData.tokenDecimals)
    // } else {
    //   eventData.tokenId = parseInt(parsedLog.args.tokenId?._hex)
    // }

    // this.webhooksService.processWebhookEvents(eventData).catch((error) => {
    //   this.logger.error(`Failed to process webhook events for event data :${eventData} - Error: ${error}`)
    // })
  }

  @logPerformance('ERC20EventsScannerService::GetTokenInfo')
  private async getTokenInfo (tokenAddress: string, abi: any, tokenType: string) {
    if (has(this.tokenInfoCache, tokenAddress)) {
      this.logger.log(`Token info for ${tokenAddress} was found in cache...`)
      const token = this.tokenInfoCache[tokenAddress]
      return [token.name, token.symbol, token.decimals]
    }

    this.logger.log(`Token info for ${tokenAddress} was not found in cache...`)

    const contract: Contract = this.ethersContract.create(
      tokenAddress,
      abi
    )

    let decimals: string

    if (tokenType === TokenType.ERC20) {
      decimals = await contract.decimals()
    }
    const name = await contract.name()
    const symbol = await contract.symbol()

    this.tokenInfoCache[tokenAddress] = { name, symbol, decimals } as TokenInfo

    return [name, symbol, decimals]
  }
}
