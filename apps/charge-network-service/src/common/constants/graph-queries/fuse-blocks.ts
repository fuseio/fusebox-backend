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

export const getBlocksQuery = (timestamps: number[]) => gql`
    query blocks {
        ${timestamps.map((timestamp) => `
        t${timestamp}: blocks(
            first: 1
            orderBy: timestamp
            orderDirection: desc
            where: { timestamp_gt: ${timestamp}, timestamp_lt: ${timestamp + 600} }
        ) {
            number
        }
        `).join('')}
    }
`
