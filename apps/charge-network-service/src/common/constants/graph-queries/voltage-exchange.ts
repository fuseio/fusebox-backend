import { gql } from 'graphql-request'

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
