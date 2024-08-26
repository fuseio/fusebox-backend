import { Injectable, Logger } from '@nestjs/common'
import { Stat, TokenStat } from './interfaces'
import { fusePriceQuery, getTokenDayDataV2, getTokenPriceByBlock } from '@app/network-service/common/constants/graph-queries/voltage-exchange-v2'
import { get, head } from 'lodash'
import { getBlockQuery, getTokenDataQuery, getTokenDayDataV3, getTokenUsdPrice } from '@app/network-service/common/constants/graph-queries/voltage-exchange-v3'

import { Duration } from 'dayjs/plugin/duration'
import { GraphQLClient } from 'graphql-request'
import { NATIVE_FUSE_ADDRESS } from '@app/notifications-service/common/constants/addresses'
import { TokenHistoricalStatisticsDto } from './dto/token-stats.dto'
import { TokenPriceChangeIntervalDto } from './dto/token-price-change-interval.dto'
import { TokenPriceDto } from './dto/token-price.dto'
import VoltageDexGraphService from '@app/network-service/voltage-dex/graph.service'
import dayjs from '@app/common/utils/dayjs'
import { getBlocksQuery } from '@app/network-service/common/constants/graph-queries/fuse-blocks'
import { getSubgraphHealth } from '../common/constants/graph-queries/health'

@Injectable()
export class VoltageDexService {
  private readonly logger = new Logger(VoltageDexService.name)

  constructor (
    private voltageDexGraphService: VoltageDexGraphService
  ) { }

  async getTokenPrice (tokenPriceDto: TokenPriceDto) {
    const address = tokenPriceDto.tokenAddress.toLowerCase()

    // Try to get price from V3
    const v3Result = await this.voltageDexGraphService.getVoltageV3Client().request<{
      token: {
        derivedUSD: string
      }
    }>(getTokenUsdPrice, { address })

    if (v3Result?.token?.derivedUSD) {
      return v3Result.token.derivedUSD
    }

    // If not found in V3, try V2
    return this.getTokenPriceV2(address)
  }

  async getTokenPriceChange (tokenPriceDto: TokenPriceDto) {
    const [currentPrice, previousPrice] = await Promise.all([
      this.getTokenPrice(tokenPriceDto),
      this.getPreviousTokenPrice(tokenPriceDto)
    ])
    const priceChange = this.getPercentChange(currentPrice, previousPrice)
    return { priceChange: priceChange.toString(), currentPrice, previousPrice }
  }

  async getTokenPriceChangeInterval (tokenPriceChangeIntervalDto: TokenPriceChangeIntervalDto) {
    const currentTime = dayjs.utc()
    const windowSize: any = tokenPriceChangeIntervalDto.timeFrame.toLowerCase()

    const time = currentTime.subtract(1, windowSize).startOf('hour').unix()

    const secondsInTimeFrame = currentTime.unix() - time
    const numberOfDays = Math.ceil(secondsInTimeFrame / (24 * 60 * 60))
    this.logger.log(`Fetching token price for ${tokenPriceChangeIntervalDto.tokenAddress} for ${numberOfDays} days`)
    const address = tokenPriceChangeIntervalDto.tokenAddress.toLowerCase()

    const [v2Token, v3Token] = await this.fetchToken(numberOfDays, address)

    if (!v2Token && !v3Token) {
      return []
    }

    const tokenDayData = this.selectBestTokenData(v2Token, v3Token)

    const parsedTokenDayData = this.parseTokenDayData(tokenDayData)

    const formattedHistory = []
    for (let i = 0; i < parsedTokenDayData.length - 1; i++) {
      const previousPrice = parsedTokenDayData[i].priceUSD
      const currentPrice = parsedTokenDayData[i + 1].priceUSD
      formattedHistory.push({
        timestamp: parsedTokenDayData[i].timestamp,
        priceChange: this.getPercentChange(currentPrice.toString(), previousPrice.toString()),
        previousPrice,
        currentPrice
      })
    }

    return formattedHistory
  }

  async getPreviousTokenPrice (tokenPriceDto: TokenPriceDto) {
    const address = this.getTokenAddressFromTokenMap(tokenPriceDto.tokenAddress.toLowerCase())
    const duration = tokenPriceDto.duration
      ? dayjs.duration(tokenPriceDto.duration)
      : dayjs.duration(1, 'days')
    const previousTimestamp = await this.getPreviousBlock(duration)
    const oneDayHighBlock = await this.getTokenData(address, previousTimestamp)
    return oneDayHighBlock?.priceUSD
  }

  async getPreviousBlock (duration: Duration) {
    const currentTime = dayjs()
    const seconds = duration.asSeconds()
    const previousTime = currentTime.subtract(seconds, 'seconds').unix()
    return this.getBlockInfoFromTimestamp(previousTime)
  }

  async getBlockInfoFromTimestamp (timestamp: number) {
    const result = await this.voltageDexGraphService.getBlockClient().request<{
      blocks: { number: string, timestamp: string }[];
    }>(getBlockQuery, {
      timestampFrom: timestamp,
      timestampTo: timestamp + 600
    })
    return Number(result?.blocks?.[0]?.timestamp)
  }

  async getTokenData (tokenAddress: string, fromTimestamp?: number) {
    const normalizedAddress = tokenAddress.toLowerCase()

    // Query V3
    const v3Result = await this.getTokenDataV3(normalizedAddress, fromTimestamp)

    // If V3 has data, return it
    if (v3Result) {
      return v3Result
    }

    // If V3 doesn't have data, query V2
    return this.getTokenDataV2(normalizedAddress, fromTimestamp)
  }

  async getTokenStats (tokenHistoricalStatisticsDto: TokenHistoricalStatisticsDto) {
    const normalizedAddress = tokenHistoricalStatisticsDto.tokenAddress.toLowerCase()
    const response = await this.voltageDexGraphService.getVoltageV3Client().request<{
      tokens: {
        tokenDayData: {
          date: number
          priceUSD: string
          volumeUSD: string
        }[]
      }[]
    }>(getTokenDataQuery, {
      first: tokenHistoricalStatisticsDto.limit ?? 30,
      tokenAddress: normalizedAddress
    })

    const data = response.tokens.map(({ tokenDayData }: { tokenDayData: { date: number; priceUSD: string; volumeUSD: string }[] }) =>
      tokenDayData.map(({ priceUSD, volumeUSD, date }: Stat) =>
        new TokenStat(tokenHistoricalStatisticsDto.tokenAddress, priceUSD, volumeUSD, date)
      )
    )

    return head(data)
  }

  private async getTokenDataV3 (tokenAddress: string, fromTimestamp?: number) {
    const result = await this.voltageDexGraphService.getVoltageV3Client().request<{
      tokens: {
        tokenDayData: {
          date: number
          priceUSD: string
          volumeUSD: string
        }[]
      }[]
    }>(getTokenDayDataV3, {
      tokenAddress,
      from: fromTimestamp,
      first: 1
    })

    return result?.tokens[0]?.tokenDayData[0]
  }

  private async getTokenDataV2 (tokenAddress: string, fromTimestamp?: number) {
    const result = await this.voltageDexGraphService.getVoltageV2Client().request<{
      tokens: {
        dayData: {
          date: number
          priceUSD: string
          volumeUSD: string
        }[]
      }[]
    }>(getTokenDayDataV2, {
      id: tokenAddress,
      from: fromTimestamp,
      first: 1
    })

    const dayData = result?.tokens[0]?.dayData[0]

    if (dayData) {
      return {
        date: dayData.date,
        priceUSD: dayData.priceUSD,
        volumeUSD: dayData.volumeUSD
      }
    }

    return null
  }

  private async fetchToken (numberOfDays: number, tokenAddress: string) {
    const promises = await Promise.allSettled([
      this.getVoltageV2Tokens(numberOfDays, tokenAddress),
      this.getVoltageV3Tokens(numberOfDays, tokenAddress)
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
    return tokenDayData.map((dayData) => {
      const { priceUSD } = dayData
      const date = dayData?.date ? dayData.date : dayData.timestamp

      return {
        priceUSD: Number(priceUSD),
        timestamp: parseFloat(date),
        date: dayjs.unix(date).format('YYYY-MM-DD')
      }
    }).sort((a, b) => a.timestamp - b.timestamp)
  }

  private async getVoltageV2Tokens (numberOfDays: number, tokenAddress: string) {
    const now = dayjs.utc()
    const response = await this.voltageDexGraphService.getVoltageV2Client().request<{
      tokens: {
        liquidity: string
        dayData: {
          date: number
          priceUSD: string
        }[]
      }[]
    }>(getTokenDayDataV2, {
      from: now.subtract(numberOfDays, 'day').unix(),
      first: numberOfDays,
      id: tokenAddress
    })

    return response?.tokens[0] || []
  }

  private async getVoltageV3Tokens (numberOfDays: number, tokenAddress: string) {
    const now = dayjs.utc()
    const response = await this.voltageDexGraphService.getVoltageV3Client().request<{
      tokens: {
        totalValueLockedUSD: string
        tokenDayData: {
          date: number
          priceUSD: string
        }[]
      }[]
    }>(getTokenDayDataV3, {
      from: now.subtract(numberOfDays, 'day').unix(),
      first: numberOfDays,
      tokenAddress
    })

    return response?.tokens[0] || []
  }

  private async getTokenPriceV2 (address: string): Promise<string> {
    const fusePrice = await this.getFusePrice()
    const tokenPrice = await this.getTokenV2Price(address)

    const price = fusePrice * tokenPrice
    return price.toString()
  }

  private async getTokenV2Price (address: string): Promise<number> {
    const response = await this.voltageDexGraphService.getVoltageV2Client().request<{
      token: {
        derivedETH: string
      }
    }>(getTokenPriceByBlock, { address: address.toLowerCase() })

    return response?.token?.derivedETH ? Number(response.token.derivedETH) : 0
  }

  private async getFusePrice (): Promise<number> {
    const result = await this.voltageDexGraphService.getVoltageV2Client().request<{
      bundles: {
        ethPrice: string
      }[]
    }>(fusePriceQuery, { id: 1 })

    return result?.bundles?.[0]?.ethPrice ? Number(result.bundles[0].ethPrice) : 0
  }

  private async getBlocksFromTimestamp (timestamps: Array<number>, skipCount = 500) {
    if (timestamps?.length === 0) {
      return []
    }

    const fetchedData: any = await this.splitQuery(
      getBlocksQuery,
      this.voltageDexGraphService.getBlockClient(),
      [],
      timestamps,
      skipCount
    )

    const blocks = []

    if (fetchedData) {
      for (const t in fetchedData) {
        if (fetchedData[t].length > 0) {
          blocks.push({
            timestamp: t.split('t')[1],
            number: fetchedData[t][0].number
          })
        }
      }
    }

    return blocks
  }

  private async getLatestBlocks () {
    const resArr = await this.voltageDexGraphService.getHealthClient().request<{
      indexingStatuses: {
        synced: boolean
        health: string
        chains: {
          chainHeadBlock: {
            number: string
          }
          latestBlock: {
            number: string
          }
        }[]
      }[]
    }>(getSubgraphHealth)
    const res = resArr?.indexingStatuses[0]
    const latestBlock = res.chains[0].latestBlock.number
    const headBlock = res.chains[0].chainHeadBlock.number
    return { latestBlock, headBlock }
  }

  private getTimestamps (startTime: number, interval = 3600) {
    const timestamps: Array<number> = []
    const utcEndTime = dayjs.utc()
    let time = startTime

    while (time < utcEndTime.unix()) {
      timestamps.push(time)
      time += interval
    }

    return timestamps
  }

  private async splitQuery (
    query: any,
    localClient: GraphQLClient,
    vars: Array<any>,
    list: Array<any>,
    skipCount = 100
  ) {
    let fetchedData = {}
    let allFound = false
    let skip = 0

    while (!allFound) {
      let end = list.length
      if (skip + skipCount < list.length) {
        end = skip + skipCount
      }

      const sliced = list.slice(skip, end)
      const q = query(...vars, sliced)
      const result = await localClient.request(q)

      fetchedData = {
        ...fetchedData,
        ...(result as Record<string, unknown>)
      }
      if (Object.keys(result).length < skipCount || skip + skipCount > list.length) {
        allFound = true
      } else {
        skip += skipCount
      }
    }

    return fetchedData
  }

  private getTokenAddressFromTokenMap (tokenAddress: string): string {
    return get({
      [NATIVE_FUSE_ADDRESS.toLowerCase()]: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629'.toLowerCase()
    }, tokenAddress, tokenAddress)
  }

  private getPercentChange (valueNow: string, value24HoursAgo: string) {
    const adjustedPercentChange =
      ((parseFloat(valueNow) - parseFloat(value24HoursAgo)) / parseFloat(value24HoursAgo)) * 100
    if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
      return 0
    }
    return adjustedPercentChange
  }
}
