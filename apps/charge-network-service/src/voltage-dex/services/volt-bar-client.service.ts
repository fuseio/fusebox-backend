import { gql, GraphQLClient } from 'graphql-request'
import { Injectable } from '@nestjs/common'

@Injectable()
export class VoltBarClient {
  constructor (private graphClient: GraphQLClient) {}

  async getRatio () {
    const query = gql`
      query ratio {
        bars {
          ratio
        }
      }
    `

    const data = await this.graphClient.request<{ bars: { ratio: string }[] }>(query)
    return data?.bars?.[0]?.ratio
  }
}
