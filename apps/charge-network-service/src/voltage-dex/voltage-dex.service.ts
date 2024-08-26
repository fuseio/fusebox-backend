import { Injectable, Logger } from '@nestjs/common'

import { TokenHistoricalStatisticsDto } from './dto/token-stats.dto'
import { TokenPriceChangeIntervalDto } from './dto/token-price-change-interval.dto'
import { TokenPriceDto } from './dto/token-price.dto'
import { TokenPriceService } from './services/token-price.service'
import { TokenStatsService } from './services/token-stats.service'

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
