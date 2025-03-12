import { gql } from 'graphql-request'

export const getTokenUsdPrice = gql`
    query getTokenUsdPrice ($address: String) {
        token(id: $address) {
            derivedUSD
        }
    }
`

export const getMultipleTokenUsdPrices = gql`
    query getMultipleTokenUsdPrices($addresses: [String!]!) {
        tokens(where: { id_in: $addresses }) {
            id
            derivedUSD
        }
    }
`

export const getBlockQuery = gql`
    query blocks($timestampFrom: Int!, $timestampTo: Int!) {
        blocks(
            first: 1
            orderBy: timestamp
            orderDirection: asc
            where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
        ) {
            id
            number
            timestamp
        }
    }
`

export const getTokenDataQuery = gql`
    query getTokenDayData($tokenAddress: String!, $first: Int!) {
        tokens(where: { id: $tokenAddress, totalValueLockedUSD_gt: 0 }) {
            tokenDayData(orderBy: date, orderDirection: desc, first: $first) {
                date
                priceUSD
                volumeUSD
            }
        }
    }
`

export const getTokenDayDataV3 = gql`
    query ($from: Int!, $first: Int!, $tokenAddress: String!) {
        tokens(where: { id: $tokenAddress, totalValueLockedUSD_gt: 0 }) {
            totalValueLockedUSD
            tokenDayData(orderBy: date, orderDirection: desc, first: $first, where: { date_gte: $from }) {
                date
                priceUSD
                volumeUSD
            }
        }
    }
`
