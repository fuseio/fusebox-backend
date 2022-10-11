import { gql } from 'graphql-request'

export const getBlock = gql`
    query blockQuery($timestampFrom: Int, $timestampTo: Int) {
        blocks(
            first: 1
            where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
            orderBy: timestamp
            orderDirection: desc
        ) {
            id
            number
            timestamp
        }
    }
`
