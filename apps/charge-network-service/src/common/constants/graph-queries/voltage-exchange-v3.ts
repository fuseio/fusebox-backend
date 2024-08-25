import { gql } from 'graphql-request'

export const getTokenUsdPrice = gql`
    query getTokenUsdPrice ($address: String) {
        token(id: $address) {
            derivedUSD
        }
    }
`

export const getTokenPriceByBlock = gql`
    query getTokenPriceByBlock ($address: String, $block: Int) {
        token(id: $address, block: { number: $block }) {
            derivedUSD
        }
    }
`

export const getPricesByBlockQuery = (tokenAddress: string, blocks: Array<any>) => gql`
    query blocks {
        ${blocks.map((block) => `
            t${block.timestamp}:token(id: "${tokenAddress}", block: { number: ${block.number} }) {
                derivedUSD
            }
        `).join('')}
    }
`

export const getTokenDailyStatsQuery = (tokenAddress: string, numberOfEntries: number = 7) => gql`
    query {
        tokenDayDatas(where: { token: "${tokenAddress}" }, first: ${numberOfEntries}, orderBy: date, orderDirection: desc) {
            id
            date
            priceUSD
            dailyVolumeUSD
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

export const getVoltageV3Tokens = gql`
    query ($from: Int!, $first: Int!, $tokenAddress: String!) {
        tokens(where: { id: $tokenAddress, totalValueLockedUSD_gt: 0 }) {
            tokenDayData(orderBy: date, orderDirection: desc, first: $first, where: { date_gte: $from }) {
                date
                priceUSD
                volumeUSD
            }
        }
    }
`
