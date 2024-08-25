import { BaseProvider } from 'nestjs-ethers'
import { ConfigService } from '@nestjs/config'
import { ScannerStatusService } from './scanner-status.service'
import { sleep } from '@app/notifications-service/common/utils/helper-functions'

export abstract class ScannerService {
  constructor (
    protected configService: ConfigService,
    protected scannerStatusService: ScannerStatusService,
    protected readonly rpcProvider: BaseProvider,
    protected readonly logger
  ) { }

  abstract processBlocks (romBlock: number, toBlock: number);

  async onModuleInit (): Promise<void> {
    this.start()
  }

  async start () {
    while (true) {
      try {
        let { number: toBlockNumber } = await this.rpcProvider.getBlock('latest')

        const status = await this.scannerStatusService.getStatus()
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
        await this.scannerStatusService.updateStatus(toBlockNumber)
      } catch (error) {
        // this.logger.error(`Failed to process blocks: ${error}`)
      }
    }
  }
}
