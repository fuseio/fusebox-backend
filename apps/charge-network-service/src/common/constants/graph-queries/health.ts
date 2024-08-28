import { gql } from 'graphql-request'

export const getSubgraphHealth = gql`
  query health {
    indexingStatuses(subgraphs: ["QmXo78rB6cYMbogVgibmbYsD2FLE2haXWXv28RhjSYz3A8"]) {
      synced
      health
      chains {
        chainHeadBlock {
          number
        }
        latestBlock {
          number
        }
      }
    }
  }
`
