import { VoltageDexService } from '@app/network-service/voltage-dex/voltage-dex.service'

import { Controller, Body } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { TokenPriceDto } from '@app/network-service/voltage-dex/dto/token-price.dto'
import { TokenPriceChangeIntervalDto } from '@app/network-service/voltage-dex/dto/token-price-change-interval.dto'
import { TokenHistoricalStatisticsDto } from '@app/network-service/voltage-dex/dto/token-stats.dto'
import { MultipleTokenPricesDto } from '@app/network-service/voltage-dex/dto/multiple-token-prices.dto'

@Controller('voltage-dex')
export class VoltageDexController {
  constructor (private readonly voltageDexService: VoltageDexService) { }

  @MessagePattern('get_token_price')
  getTokenPrice (@Body() tokenPriceDto: TokenPriceDto) {
    return this.voltageDexService.getTokenPrice(tokenPriceDto)
  }

  @MessagePattern('get_multiple_token_prices')
  getMultipleTokenPrices (@Body() multipleTokenPricesDto: MultipleTokenPricesDto) {
    return this.voltageDexService.getMultipleTokenPrices(multipleTokenPricesDto)
  }

  @MessagePattern('get_token_price_change')
  getTokenPriceChange (@Body() tokenPriceDto: TokenPriceDto) {
    return this.voltageDexService.getTokenPriceChange(tokenPriceDto)
  }

  @MessagePattern('get_token_price_change_over_time')
  getTokenPriceChangeOverTime (@Body() tokenPriceDto: TokenPriceDto) {
    return this.voltageDexService.getTokenPriceChange(tokenPriceDto)
  }

  @MessagePattern('get_token_price_changes_over_interval')
  getTokenPriceChangesOverInterval (@Body() tokenPriceChangeIntervalDto: TokenPriceChangeIntervalDto) {
    return this.voltageDexService.getTokenPriceChangeInterval(tokenPriceChangeIntervalDto)
  }

  @MessagePattern('get_token_historical_statistics')
  getTokenHistoricalStatistics (@Body() tokenHistoricalStatisticsDto: TokenHistoricalStatisticsDto) {
    return this.voltageDexService.getTokenStats(tokenHistoricalStatisticsDto)
  }
}
