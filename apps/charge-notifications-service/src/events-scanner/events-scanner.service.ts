import { ERC20_TRANSFER_EVENT_HASH } from '@app/notifications-service/common/constants/events';
import { logPerformance } from '@app/notifications-service/common/decorators/log-performance.decorator';
import erc20TransferToFilter from '@app/notifications-service/common/filters/erc20-transfer-to-filter';
import IEventFilter from '@app/notifications-service/common/interfaces/event-filter.interface';
import { getTokenTypeAbi, getTransferEventTokenType, parseLog, sleep } from '@app/notifications-service/common/utils/helper-functions';
import { eventsScannerStatusModelString } from '@app/notifications-service/events-scanner/events-scanner.constants';
import { EventsScannerStatus } from '@app/notifications-service/events-scanner/interfaces/events-scaner-status.interface';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { BaseProvider, InjectEthersProvider, Log } from 'nestjs-ethers';

@Injectable()
export class EventsScannerService {
    eventfilters: Array<any> = []

    constructor (
        @Inject(eventsScannerStatusModelString)
        private eventsScannerStatusModel: Model<EventsScannerStatus>,
        @InjectEthersProvider()
        private readonly rpcProvider: BaseProvider,
        private configService: ConfigService
    ) { }

    async onModuleInit(): Promise<void> {
        this.eventfilters.push(erc20TransferToFilter)
        await this.start()
    }
    
    async start () {
        while (true) {
          try {
            const { number: toBlockNumber } = await this.rpcProvider.getBlock('latest')
            
            const status = await this.getStatus('events')
            const fromBlockNumber = status.blockNumber
            ? status.blockNumber + 1
            : toBlockNumber

            if (fromBlockNumber >= toBlockNumber) {
                const timeout: number = this.configService.get('rpcConfig').timeoutInterval
                console.log(`Sleeping for ${timeout}`);
                
                await sleep(timeout)
            }

            await this.processBlocks(
              fromBlockNumber,
              toBlockNumber
            )

            await this.updateStatus('events', toBlockNumber)


            } catch (error) {
                console.log('Failed to process blocks:')
                console.error(error)
            }
        }
    }

    
    async getStatus(filter: string) {
        const status = await this.eventsScannerStatusModel.findOne({
            filter
          })
      
          if (status) {
            return status
          }
      
          const newStatus = await this.eventsScannerStatusModel.create({
            filter
          })
          return newStatus 
    }

    async updateStatus(filter: string, blockNumber: number) {
      await this.eventsScannerStatusModel.updateOne({filter}, {blockNumber}, {upsert: true})
    }

    @logPerformance('EventScanner::ProcessBlocks')
    async processBlocks (fromBlock: number, toBlock: number) {
        if (fromBlock > toBlock) return

        console.log(`EventFilter: Processing blocks from ${fromBlock} to ${toBlock}`)

        const logs = await this.rpcProvider.getLogs({fromBlock, toBlock, topics: [ERC20_TRANSFER_EVENT_HASH]})

        for (const log of logs) {
            try {
              await this.processEvent(log, erc20TransferToFilter)
            } catch (error) {
              console.error('Failed to process log:')
              console.error({ log })
              console.error(error)
            }
        }
    }

    @logPerformance('EventScanner::ProcessEvent')
    async processEvent (log: Log, filter: IEventFilter) {
        if (filter.name === erc20TransferToFilter.name) {
        await this.processErc20TransferEvent(log, filter)
        }
    }

    @logPerformance('EventScanner::ProcessERC20Event')
    async processErc20TransferEvent (log: Log, filter: IEventFilter) {
        const tokenType = getTransferEventTokenType(log)
        const abi = getTokenTypeAbi(tokenType)

        const parsedLog = parseLog(log, abi)
        const fromAddress = parsedLog.args[0]
        const toAddress = parsedLog.args[1]

        const data = {
            to: toAddress,
            from: fromAddress,
            value: parsedLog.args[2].toString(),
            txHash: parsedLog.transactionHash,
            address: parsedLog.address,
            blockNumber: log.blockNumber,
            blockHash: log.blockHash,
            tokenType: tokenType?.valueOf()
        }

        console.log(JSON.stringify(data));
        
    }
}
