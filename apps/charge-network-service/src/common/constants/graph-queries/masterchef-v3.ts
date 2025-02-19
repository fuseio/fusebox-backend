import { gql } from 'graphql-request'

export const GET_SIMPLE_STAKING_POOL_DATA = gql`
  query getPoolData($poolId: String!) {
    pool(id: $poolId) {
      balance
      rewarder {
        tokenPerSec
      }
    }
  }
`
