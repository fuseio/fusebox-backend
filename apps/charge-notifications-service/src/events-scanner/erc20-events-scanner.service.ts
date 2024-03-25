import { TokenType } from '@app/notifications-service/common/constants/token-types'
import { logPerformance } from '@app/notifications-service/common/decorators/log-performance.decorator'
import { getTokenTypeAbi, getTransferEventTokenType, parseLog } from '@app/notifications-service/common/utils/helper-functions'
import { ERC20LogsFilterString, ERC20ScannerStatusServiceString } from '@app/notifications-service/events-scanner/events-scanner.constants'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectEthersProvider, EthersContract, InjectContractProvider } from 'nestjs-ethers'
import { Log, formatUnits, JsonRpcProvider } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'
import { TokenEventData } from '@app/notifications-service/common/interfaces/event-data.interface'
import { WebhooksService } from '@app/notifications-service/webhooks/webhooks.service'
import { TokenInfo } from '@app/notifications-service/events-scanner/interfaces/token-info-cache'
import { LogFilter } from '@app/notifications-service/events-scanner/interfaces/logs-filter'
import { EventsScannerService } from './events-scanner.service'
import { ScannerStatusService } from '@app/notifications-service/common/scanner-status.service'
import { GasService } from '@app/common/services/gas.service'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

@Injectable()
export class ERC20EventsScannerService extends EventsScannerService {
  constructor (
    configService: ConfigService,
    @Inject(ERC20ScannerStatusServiceString)
    scannerStatusService: ScannerStatusService,
    @Inject(ERC20LogsFilterString)
    logsFilter: LogFilter,
    @InjectEthersProvider('regular-node')
    rpcProvider: JsonRpcProvider,
    @InjectContractProvider('regular-node')
    private readonly ethersContract: EthersContract,
    private webhooksService: WebhooksService,
    private gasService: GasService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    super(configService, scannerStatusService, logsFilter, rpcProvider, new Logger(ERC20EventsScannerService.name))
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

    const tokenType = getTransferEventTokenType(log)
    const abi = getTokenTypeAbi(tokenType)

    const parsedLog = parseLog(log, abi)
    const fromAddress = parsedLog.args[0]
    const toAddress = parsedLog.args[1]

    const tokenAddress = parsedLog.address

    let name: string
    let symbol: string
    let decimals: number

    try {
      [name, symbol, decimals] = await this.getTokenInfo(tokenAddress, abi, tokenType)
    } catch (err) {
      this.logger.error(`Unable to get token info at address ${tokenAddress}: \n${err}`)
    }

    const gasValues = await this.gasService.fetchTransactionGasCosts(
      parsedLog.transactionHash,
      this.rpcProvider
    )

    const eventData: TokenEventData = {
      to: toAddress,
      from: fromAddress,
      txHash: parsedLog.transactionHash,
      tokenAddress: parsedLog.address,
      blockNumber: log.blockNumber,
      blockHash: log.blockHash,
      tokenType: tokenType?.valueOf(),
      tokenName: name,
      tokenSymbol: symbol,
      value: null,
      tokenDecimals: null,
      tokenId: null,
      valueEth: null,
      isInternalTransaction: false,
      ...gasValues
    }

    if (tokenType === TokenType.ERC20) {
      eventData.value = BigNumber.from(parsedLog.args[2]).toString()
      eventData.tokenDecimals = decimals
      eventData.valueEth = formatUnits(eventData.value, eventData.tokenDecimals)
    } else {
      eventData.tokenId = parseInt(parsedLog.args.tokenId?._hex)
    }

    this.webhooksService.processWebhookTokenEvents(eventData).catch((error) => {
      this.logger.error(`Failed to process webhook events for event data :${eventData} - Error: ${error}`)
    })
  }

  @logPerformance('ERC20EventsScannerService::GetTokenInfo')
  private async getTokenInfo (tokenAddress: string, abi: any, tokenType: string) {
    const token = await this.cacheManager.get(tokenAddress) as TokenInfo
    if (token) {
      this.logger.log(`Token info for ${tokenAddress} was found in cache...`)
      return [token.name, token.symbol, token.decimals]
    }

    this.logger.log(`Token info for ${tokenAddress} was not found in cache...`)

    const contract = this.ethersContract.create(
      tokenAddress,
      abi
    )

    let decimals: string

    if (tokenType === TokenType.ERC20) {
      decimals = await contract.decimals()
    }
    const name = await contract.name()
    const symbol = await contract.symbol()
    await this.cacheManager.set(tokenAddress, { name, symbol, decimals } as TokenInfo)

    return [name, symbol, decimals]
  }
}
