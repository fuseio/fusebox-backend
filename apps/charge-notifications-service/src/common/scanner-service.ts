import { sleep } from '@app/notifications-service/common/utils/helper-functions'
import { BaseProvider } from 'nestjs-ethers'
import { ConfigService } from '@nestjs/config'

export abstract class ScannerService {
  constructor (
    protected readonly rpcProvider: BaseProvider,
    protected readonly statusFilter,
    protected readonly statusModel,
    protected configService: ConfigService,
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

        const status = await this.getStatus()
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

        await this.updateStatus(toBlockNumber)
      } catch (error) {
        this.logger.error(`Failed to process blocks: ${error}`)
      }
    }
  }

  async getStatus () {
    const status = await this.statusModel.findOne({
      filter: this.statusFilter
    })

    if (status) {
      return status
    }

    const newStatus = await this.statusModel.create({
      filter: this.statusFilter
    })
    return newStatus
  }

  async updateStatus (blockNumber: number) {
    await this.statusModel.updateOne({ filter: this.statusFilter }, { blockNumber }, { upsert: true })
  }
}
