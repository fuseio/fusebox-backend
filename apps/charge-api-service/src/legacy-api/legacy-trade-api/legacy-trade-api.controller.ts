import { Controller, Query, Get, Post, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { TradeApiService } from '@app/api-service/legacy-api/legacy-trade-api/trade-api.service'
import { DurationDto } from '@app/network-service/voltage-dex/dto/duration.dto'

@ApiTags('Trade V1')
@UseGuards(IsValidPublicApiKeyGuard)
@Controller({ path: 'v0/trade' })
export class LegacyTradeApiController {
  constructor (private readonly tradeApiService: TradeApiService) {}

  @Get('price/:tokenAddress')
  @ApiOperation({ summary: 'Get latest price for a token' })
  @ApiParam({ name: 'tokenAddress', description: 'The currency address' })
  @ApiResponse({ status: 200, description: 'Success response with price data' })
  async getTokenPrice (@Param('tokenAddress') tokenAddress: string) {
    const price = await this.tradeApiService.getTokenPrice(tokenAddress)
    return {
      data: { price }
    }
  }

  @Get('pricechange/:tokenAddress')
  @ApiOperation({ summary: 'Get price change for token over last 24 hours' })
  @ApiParam({ name: 'tokenAddress', description: 'The currency address' })
  @ApiResponse({ status: 200, description: 'Success response with price change data' })
  async getTokenPriceChange (@Param('tokenAddress') tokenAddress: string) {
    const priceChange = await this.tradeApiService.getTokenPriceChange(tokenAddress)
    return {
      data: priceChange
    }
  }

  @Post('pricechange/:tokenAddress')
  @ApiOperation({ summary: 'Get price change for token over time duration' })
  @ApiParam({ name: 'tokenAddress', description: 'The currency address' })
  @ApiBody({ description: 'The duration object to calculate the price change over the timeFrame duration should be passed as an object according to https://day.js.org/docs/en/durations/creating for example duration of {days: 1} means a duration of one day' })
  @ApiResponse({ status: 200, description: 'Success response with price change data' })
  async getTokenPriceChangeOverTime (
    @Param('tokenAddress') tokenAddress: string,
    @Body() durationDto: DurationDto
  ) {
    const priceChange = await this.tradeApiService.getTokenPriceChangeOverTime(tokenAddress, durationDto.duration)
    return {
      data: priceChange
    }
  }

  @Get('pricechange/interval/:timeFrame/:tokenAddress')
  @ApiOperation({ summary: 'Get price changes over an interval for token' })
  @ApiParam({ name: 'tokenAddress', description: 'The address of the token' })
  @ApiParam({ name: 'timeFrame', description: 'How far to look back', enum: ['YEAR', 'MONTH', 'WEEK'] })
  @ApiResponse({ status: 200, description: 'Success response with price changes data' })
  async getTokenPriceChangeOverInterval (
    @Param('tokenAddress') tokenAddress: string,
    @Param('timeFrame') timeFrame: string
  ) {
    const priceChanges = await this.tradeApiService.getTokenPriceChangesOverInterval(tokenAddress, timeFrame)
    return {
      data: priceChanges
    }
  }

  @Get('stats/:tokenAddress')
  @ApiOperation({ summary: 'Get historical statistics of the token' })
  @ApiParam({ name: 'tokenAddress', description: 'The currency address' })
  @ApiQuery({ name: 'limit', description: 'The number of days to return statistics for', required: false })
  @ApiResponse({ status: 200, description: 'Success response with token stats data' })
  async getTokenHistoricalStatistics (
    @Param('tokenAddress') tokenAddress: string,
    @Query('limit') limit: number
  ) {
    const stats = await this.tradeApiService.getTokenHistoricalStatistics(tokenAddress, limit)
    return {
      data: stats
    }
  }
}
