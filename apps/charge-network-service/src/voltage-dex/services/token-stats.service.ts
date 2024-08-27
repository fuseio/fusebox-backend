import { Stat, TokenStat } from '@app/network-service/voltage-dex/interfaces'

import { Injectable } from '@nestjs/common'
import { TokenAddressMapper } from '@app/network-service/voltage-dex/services/token-address-mapper.service'
import { TokenHistoricalStatisticsDto } from '@app/network-service/voltage-dex/dto/token-stats.dto'
import { TokenPriceChangeIntervalDto } from '@app/network-service/voltage-dex/dto/token-price-change-interval.dto'
import { VoltageV2Client } from '@app/network-service/voltage-dex/services/voltage-v2-client.service'
import { VoltageV3Client } from '@app/network-service/voltage-dex/services/voltage-v3-client.service'
import dayjs from '@app/common/utils/dayjs'
import { head } from 'lodash'

@Injectable()
export class TokenStatsService {
  constructor (
    private voltageV2Client: VoltageV2Client,
    private voltageV3Client: VoltageV3Client,
    private tokenAddressMapper: TokenAddressMapper
  ) {}

  async getTokenStats (dto: TokenHistoricalStatisticsDto) {
    const address = this.tokenAddressMapper.getTokenAddress(dto.tokenAddress)
    const stats = await this.voltageV3Client.getTokenStats(address, dto.limit ?? 30)
    return this.mapTokenStats(stats, dto.tokenAddress)
  }

  async getTokenPriceChangeInterval (dto: TokenPriceChangeIntervalDto) {
    const currentTime = dayjs.utc()
    const windowSize: any = dto.timeFrame.toLowerCase()
    const time = currentTime.subtract(1, windowSize).startOf('hour').unix()
    const secondsInTimeFrame = currentTime.unix() - time
    const numberOfDays = Math.ceil(secondsInTimeFrame / (24 * 60 * 60))

    const address = this.tokenAddressMapper.getTokenAddress(dto.tokenAddress)
    const [v2Token, v3Token] = await this.fetchToken(numberOfDays, address)

    if (!v2Token && !v3Token) {
      return []
    }

    const tokenDayData = this.selectBestTokenData(v2Token, v3Token)
    const parsedTokenDayData = this.parseTokenDayData(tokenDayData)

    return this.formatPriceChangeHistory(parsedTokenDayData)
  }

  private mapTokenStats (stats: any, tokenAddress: string) {
    return head(stats.tokens.map(({ tokenDayData }: { tokenDayData: { date: number; priceUSD: string; volumeUSD: string }[] }) =>
      tokenDayData.map(({ priceUSD, volumeUSD, date }: Stat) =>
        new TokenStat(tokenAddress, priceUSD, volumeUSD, date)
      )
    ))
  }

  private async fetchToken (numberOfDays: number, tokenAddress: string) {
    const promises = await Promise.allSettled([
      this.voltageV2Client.getTokenDayData(tokenAddress, numberOfDays),
      this.voltageV3Client.getTokenDayData(tokenAddress, numberOfDays)
    ])

    return promises.map((promise) => (promise.status === 'fulfilled' ? promise.value : null))
  }

  private selectBestTokenData (v2Token: any, v3Token: any) {
    const v2Liquidity = Number(v2Token?.liquidity ?? 0)
    const v2TokenDayDataLength = v2Token?.dayData?.length ?? 0

    const v3TVL = Number(v3Token?.totalValueLockedUSD ?? 0)
    const v3TokenDayDataLength = v3Token?.tokenDayData?.length ?? 0

    if (v2TokenDayDataLength >= v3TokenDayDataLength && v2Liquidity >= v3TVL) {
      return v2Token?.dayData
    } else if (v3TokenDayDataLength >= v2TokenDayDataLength && v3TVL >= v2Liquidity) {
      return v3Token?.tokenDayData
    } else {
      // Default to one with highest TVL
      return v2Liquidity > v3TVL ? v2Token?.dayData : v3Token?.tokenDayData
    }
  }

  private parseTokenDayData (tokenDayData: any[]) {
    return tokenDayData.map((dayData) => ({
      priceUSD: Number(dayData.priceUSD),
      timestamp: parseFloat(dayData.date ?? dayData.timestamp),
      date: dayjs.unix(dayData.date ?? dayData.timestamp).format('YYYY-MM-DD')
    })).sort((a, b) => a.timestamp - b.timestamp)
  }

  private formatPriceChangeHistory (parsedTokenDayData: Array<{ timestamp: number; priceUSD: number; date: string }>): Array<{
    timestamp: number;
    priceChange: number;
    previousPrice: number;
    currentPrice: number;
  }> {
    return parsedTokenDayData.slice(0, -1).map((currentDay, index) => {
      const nextDay = parsedTokenDayData[index + 1]
      return {
        timestamp: currentDay.timestamp,
        priceChange: this.calculatePercentChange(nextDay.priceUSD.toString(), currentDay.priceUSD.toString()),
        previousPrice: currentDay.priceUSD,
        currentPrice: nextDay.priceUSD
      }
    })
  }

  private calculatePercentChange (valueNow: string, valueBefore: string): number {
    const adjustedPercentChange =
      ((parseFloat(valueNow) - parseFloat(valueBefore)) / parseFloat(valueBefore)) * 100
    if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
      return 0
    }
    return adjustedPercentChange
  }
}
