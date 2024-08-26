import { getTokenDataQuery, getTokenDayDataV3, getTokenUsdPrice } from '@app/network-service/common/constants/graph-queries/voltage-exchange-v3'

import { GraphQLClient } from 'graphql-request'
import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'

@Injectable()
export class VoltageV3Client {
  constructor (private graphClient: GraphQLClient) {}

  async getTokenPrice (address: string): Promise<string | null> {
    try {
      const { token } = await this.graphClient.request<{
        token?: { derivedUSD: string }
      }>(getTokenUsdPrice, { address })

      const price = token?.derivedUSD
      return price && price !== '0' ? price : null
    } catch (error) {
      console.error(`Error fetching token price for address ${address}:`, error)
      return null
    }
  }

  async getTokenStats (address: string, limit: number): Promise<any> {
    const result = await this.graphClient.request<{
      tokens: {
        tokenDayData: {
          date: number
          priceUSD: string
          volumeUSD: string
        }[]
      }[]
    }>(getTokenDataQuery, {
      first: limit,
      tokenAddress: address
    })

    return result
  }

  async getTokenData (tokenAddress: string, fromTimestamp?: number) {
    const result = await this.graphClient.request<{
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

  async getTokenDayData (tokenAddress: string, numberOfDays: number) {
    const now = dayjs.utc()
    const response = await this.graphClient.request<{
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
}
