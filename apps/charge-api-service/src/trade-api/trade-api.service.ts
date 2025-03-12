import { Inject, Injectable } from '@nestjs/common'
import { networkService } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'

@Injectable()
export class TradeApiService {
  constructor (
    @Inject(networkService) private readonly networkClient: ClientProxy
  ) { }

  async getTokenPrice (tokenAddress: string): Promise<string> {
    return callMSFunction(this.networkClient, 'get_token_price', { tokenAddress })
  }

  async getMultipleTokenPrices (tokenAddresses: string[]): Promise<string[]> {
    return callMSFunction(this.networkClient, 'get_multiple_token_prices', { tokenAddresses })
  }

  async getTokenPriceChange (tokenAddress: string): Promise<string> {
    return callMSFunction(this.networkClient, 'get_token_price_change', { tokenAddress })
  }

  async getTokenPriceChangeOverTime (tokenAddress: string, duration?: Record<string, number>): Promise<string> {
    return callMSFunction(this.networkClient, 'get_token_price_change_over_time', { tokenAddress, duration })
  }

  async getTokenPriceChangesOverInterval (tokenAddress: string, timeFrame: string): Promise<string> {
    return callMSFunction(this.networkClient, 'get_token_price_changes_over_interval', { tokenAddress, timeFrame })
  }

  async getTokenHistoricalStatistics (tokenAddress: string, limit: number): Promise<string> {
    return callMSFunction(this.networkClient, 'get_token_historical_statistics', { tokenAddress, limit })
  }
}
