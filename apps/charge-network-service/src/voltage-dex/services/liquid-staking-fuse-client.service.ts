import { gql, GraphQLClient } from 'graphql-request'
import { Injectable } from '@nestjs/common'
import { formatEther } from 'nestjs-ethers'

@Injectable()
export class LiquidStakingFuseClient {
  constructor (private graphClient: GraphQLClient) {}

  async getRatio () {
    const query = gql`
      query ratio {
        liquidStakings {
          ratio
        }
      }
    `

    const data = await this.graphClient.request<{ liquidStakings: { ratio: string }[] }>(query)
    return formatEther(data?.liquidStakings?.[0]?.ratio ?? '0')
  }
}
