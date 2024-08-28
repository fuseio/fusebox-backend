import { Duration } from 'dayjs/plugin/duration'
import { GraphQLClient } from 'graphql-request'
import { Injectable } from '@nestjs/common'
import dayjs from '@app/common/utils/dayjs'
import { getBlockQuery } from '@app/network-service/common/constants/graph-queries/voltage-exchange-v3'

@Injectable()
export class BlocksClient {
  constructor (private graphClient: GraphQLClient) {}

  async getPreviousBlock (duration: Duration) {
    const currentTime = dayjs()
    const seconds = duration.asSeconds()
    const previousTime = currentTime.subtract(seconds, 'seconds').unix()

    return this.getBlockInfoFromTimestamp(previousTime)
  }

  async getBlockInfoFromTimestamp (timestamp: number) {
    const result = await this.graphClient.request<{
      blocks: { number: string, timestamp: string }[];
    }>(getBlockQuery, {
      timestampFrom: timestamp,
      timestampTo: timestamp + 600
    })

    return Number(result?.blocks?.[0]?.timestamp)
  }
}
