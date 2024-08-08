import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UnmarshalService } from 'apps/charge-network-service/src/balances/services/unmarshal-balance.service'
import { ExplorerService } from 'apps/charge-network-service/src/balances/services/explorer-balance.service'
import { BalanceService } from 'apps/charge-network-service/src/balances/interfaces/balances.interface'

@Injectable()
export default class BalancesService {
  private readonly logger = new Logger(BalancesService.name)

  constructor (
    private readonly configService: ConfigService,
    private readonly unmarshalService: UnmarshalService,
    private readonly explorerService: ExplorerService
  ) {}

  private get primaryService (): BalanceService {
    const primaryService = this.configService.get('primaryService')
    return primaryService === 'explorer' ? this.explorerService : this.unmarshalService
  }

  private get fallbackService (): BalanceService {
    const primaryService = this.configService.get('primaryService')
    return primaryService === 'explorer' ? this.unmarshalService : this.explorerService
  }

  async getERC20TokenBalances (address: string) {
    try {
      return await this.primaryService.getERC20TokenBalances(address)
    } catch (error) {
      this.logger.error(`Primary service failed: ${error.message}. Falling back to secondary service.`)
      return await this.fallbackService.getERC20TokenBalances(address)
    }
  }

  async getERC721TokenBalances (address: string, limit?: number, cursor?: string) {
    try {
      return await this.primaryService.getERC721TokenBalances(address, limit, cursor)
    } catch (error) {
      this.logger.error(`Primary service failed: ${error.message}. Falling back to secondary service.`)
      return await this.fallbackService.getERC721TokenBalances(address, limit, cursor)
    }
  }
}
