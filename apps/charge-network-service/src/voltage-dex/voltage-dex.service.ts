import { Injectable, Logger } from '@nestjs/common'

import { TokenHistoricalStatisticsDto } from '@app/network-service/voltage-dex/dto/token-stats.dto'
import { TokenPriceChangeIntervalDto } from '@app/network-service/voltage-dex/dto/token-price-change-interval.dto'
import { TokenPriceDto } from '@app/network-service/voltage-dex/dto/token-price.dto'
import { TokenPriceService } from '@app/network-service/voltage-dex/services/token-price.service'
import { TokenStatsService } from '@app/network-service/voltage-dex/services/token-stats.service'

@Injectable()
export class VoltageDexService {
  private readonly logger = new Logger(VoltageDexService.name)

  constructor (
    private tokenPriceService: TokenPriceService,
    private tokenStatsService: TokenStatsService
  ) { }

  async getTokenPrice (dto: TokenPriceDto): Promise<string> {
    return this.tokenPriceService.getTokenPrice(dto)
  }

  async getTokenPriceChange (dto: TokenPriceDto) {
    return this.tokenPriceService.getTokenPriceChange(dto)
  }

  async getTokenPriceChangeInterval (dto: TokenPriceChangeIntervalDto) {
    return this.tokenStatsService.getTokenPriceChangeInterval(dto)
  }

  async getTokenStats (dto: TokenHistoricalStatisticsDto) {
    return this.tokenStatsService.getTokenStats(dto)
  }
}
