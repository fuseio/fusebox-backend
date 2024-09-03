import { Controller, Query, Get, Post, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiOkResponse } from '@nestjs/swagger'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { TradeApiService } from '@app/api-service/trade-api/trade-api.service'
import { DurationDto } from '@app/network-service/voltage-dex/dto/duration.dto'
import { DurationEntity } from '@app/network-service/voltage-dex/entities/duration.entity'

@ApiTags('Trade V1')
@UseGuards(IsValidPublicApiKeyGuard)
@Controller({ path: 'v0/trade' })
export class TradeApiController {
  constructor (private readonly tradeApiService: TradeApiService) {}

  @Get('price/:tokenAddress')
  @ApiOperation({ summary: 'Get latest price for a token' })
  @ApiParam({
    name: 'tokenAddress',
    description: 'The currency address',
    example: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629'
  })
  @ApiOkResponse({
    description: 'Success response with price data',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            price: { type: 'string', example: '0.03345197440906984362974767871408538' }
          }
        }
      }
    }
  })
  async getTokenPrice (@Param('tokenAddress') tokenAddress: string) {
    const price = await this.tradeApiService.getTokenPrice(tokenAddress)
    return {
      data: { price }
    }
  }

  @Get('pricechange/:tokenAddress')
  @ApiOperation({
    summary: 'Get price change for token over last 24 hours'
  })
  @ApiParam({
    name: 'tokenAddress',
    description: 'The currency address',
    example: '0x6a5F6A8121592BeCd6747a38d67451B310F7f156'
  })
  @ApiOkResponse({
    description: 'Success response with price change data',
    schema: {
      properties: {
        data: {
          type: 'object',
          properties: {
            priceChange: { type: 'string', example: '0.2578529952981377' },
            currentPrice: { type: 'string', example: '0.9655060329704421' },
            previousPrice: { type: 'string', example: '0.9630228497070669777180667923340947' }
          }
        }
      }
    }
  })
  async getTokenPriceChange (@Param('tokenAddress') tokenAddress: string) {
    const priceChange = await this.tradeApiService.getTokenPriceChange(tokenAddress)
    return {
      data: priceChange
    }
  }

  @Post('pricechange/:tokenAddress')
  @ApiOperation({
    summary: 'Get price change for token over time duration'
  })
  @ApiParam({
    name: 'tokenAddress',
    description: 'The currency address',
    example: '0x6a5F6A8121592BeCd6747a38d67451B310F7f156'
  })
  @ApiBody({
    type: DurationEntity,
    description: 'Duration object for price change calculation. Format: {days: 1} for one day. See day.js docs for more options.',
    examples: {
      oneDay: {
        value: { days: 1 },
        summary: 'One day duration'
      },
      sevenDays: {
        value: { days: 7 },
        summary: 'Seven days duration'
      }
    }
  })
  @ApiOkResponse({
    description: 'Success response with price change data',
    schema: {
      properties: {
        data: {
          type: 'object',
          properties: {
            priceChange: { type: 'string', example: '0.2578529952981377' },
            currentPrice: { type: 'string', example: '0.9655060329704421' },
            previousPrice: { type: 'string', example: '0.9630228497070669777180667923340947' }
          }
        }
      }
    }
  })
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
  @ApiOkResponse({
    description: 'Success response with price changes data',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              timestamp: { type: 'number', example: 1724112000 },
              priceChange: { type: 'number', example: 1.5423772022597726 },
              previousPrice: { type: 'number', example: 0.033812203304188444 },
              currentPrice: { type: 'number', example: 0.03433371501953397 }
            }
          }
        }
      }
    }
  })
  async getTokenPriceChangeOverInterval (
    @Param('tokenAddress') tokenAddress: string,
    @Param('timeFrame') timeFrame: string
  ) {
    // The old timeFrame values include `hour`, `day` & `all`.
    // To make it backward compatible, we need to check if the timeFrame is one of these.
    // If it is, we need to convert it to the new timeFrame values.
    const timeFrameMap = {
      HOUR: 'WEEK',
      DAY: 'WEEK',
      ALL: 'YEAR'
    }
    const newTimeFrame = timeFrameMap[timeFrame]
    const priceChanges = await this.tradeApiService.getTokenPriceChangesOverInterval(tokenAddress, newTimeFrame)
    return {
      data: priceChanges
    }
  }

  @Get('stats/:tokenAddress')
  @ApiOperation({ summary: 'Get historical statistics of the token' })
  @ApiParam({
    name: 'tokenAddress',
    description: 'The currency address',
    example: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629'
  })
  @ApiQuery({ name: 'limit', description: 'The number of days to return statistics for', required: false })
  @ApiOkResponse({
    description: 'Success response with token stats data',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              address: { type: 'string', example: '0x28C3d1cD466Ba22f6cae51b1a4692a831696391A' },
              price: { type: 'string', example: '1' },
              volume: { type: 'string', example: '43808.78168762966365023095547507466' },
              timestamp: { type: 'number', example: 1724716800 },
              date: { type: 'string', format: 'date-time', example: '2024-08-27T00:00:00.000Z' }
            }
          }
        }
      }
    }
  })
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
