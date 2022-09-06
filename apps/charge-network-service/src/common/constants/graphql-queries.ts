import { gql } from 'graphql-request'

export const getBarUser = gql`
    query BarUser($barId: String!, $userId: String!) {
        bar(id: $barId) {
            ratio
        }
        user(id: $userId) {
            xVolt
        }
    }
`

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

export const getBar = gql`
    query Bar($barId: String!) {
        bar(id: $barId) {
            ratio
            totalSupply
        }
    }
`

export const getFactories = gql`
    query Factories($blockNumber: Int!) {
        historicalFactory: uniswapFactories(first: 1, block: { number: $blockNumber }) {
            id
            totalVolumeUSD
            totalLiquidityUSD
        }
        latestFactory: uniswapFactories(first: 1) {
            id
            totalVolumeUSD
            totalLiquidityUSD
        }
    }
`
