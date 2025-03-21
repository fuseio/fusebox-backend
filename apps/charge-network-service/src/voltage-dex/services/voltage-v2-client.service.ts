import { fusePriceQuery, getMultipleTokenPrices, getTokenDayDataV2, getTokenPriceByBlock } from '@app/network-service/common/constants/graph-queries/voltage-exchange-v2'

import { GraphQLClient } from 'graphql-request'
import { Injectable } from '@nestjs/common'
import dayjs from '@app/common/utils/dayjs'
import { DerivedTokenPrices, TokenPrices } from '../types'

@Injectable()
export class VoltageV2Client {
  constructor (private graphClient: GraphQLClient) { }

  async getTokenPrice (address: string): Promise<string> {
    const [fusePrice, tokenPrice] = await Promise.all([
      this.getFusePrice(),
      this.getTokenV2Price(address)
    ])

    return (fusePrice * tokenPrice).toString()
  }

  async getTokenV2Price (address: string): Promise<number> {
    const response = await this.graphClient.request<{
      token: {
        derivedETH: string
      }
    }>(getTokenPriceByBlock, { address: address.toLowerCase() })

    return response?.token?.derivedETH ? Number(response.token.derivedETH) : 0
  }

  async getMultipleTokenPrices (addresses: string[]): Promise<TokenPrices> {
    const derivedPrices = await this.getMultipleDerivedTokenPrices(addresses)
    const fusePrice = await this.getFusePrice()

    return Object.fromEntries(
      Object.entries(derivedPrices).map(([address, price]) => {
        return [address, (price ?? 0 * fusePrice).toString()]
      })
    )
  }

  private async getMultipleDerivedTokenPrices (addresses: string[]): Promise<DerivedTokenPrices> {
    const result = await this.graphClient.request<{
      tokens: { id: string; derivedETH: string }[]
    }>(getMultipleTokenPrices, { addresses })

    return result.tokens.reduce((acc, token) => {
      const rawPrice = token.derivedETH
      const price = rawPrice && rawPrice !== '0' ? Number(rawPrice) : null
      acc[token.id] = price
      return acc
    }, {})
  }

  async getFusePrice (): Promise<number> {
    const result = await this.graphClient.request<{
      bundles: {
        ethPrice: string
      }[]
    }>(fusePriceQuery, { id: 1 })

    return result?.bundles?.[0]?.ethPrice ? Number(result.bundles[0].ethPrice) : 0
  }

  async getTokenData (tokenAddress: string, fromTimestamp?: number) {
    const result = await this.graphClient.request<{
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

  async getTokenDayData (tokenAddress: string, numberOfDays: number) {
    const now = dayjs.utc()
    const response = await this.graphClient.request<{
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
}
