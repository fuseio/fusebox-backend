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

export const getTokenPriceByBlock = gql`
    query getTokenPrice($address: ID!) {
        token(id: $address) {
            derivedETH
        }
    }
`

export const bundleFields = gql`
    fragment bundleFields on Bundle {
        id
        ethPrice
    }
`

export const fusePriceQuery = gql`
    query ethPriceQuery($id: Int! = 1, $block: Block_height) {
        bundles(id: $id, block: $block) {
            ...bundleFields
        }
    }

    ${bundleFields}
`

export const getTokenDayDataV2 = gql`
    query ($id: String!, $from: Int!, $first: Int!) {
        tokens(where: { id: $id, liquidity_gt: 0 }) {
            id
            liquidity
            dayData(orderBy: date, orderDirection: desc, first: $first, where: { date_gte: $from }) {
                date
                priceUSD
                volumeUSD
            }
        }
    }
`
