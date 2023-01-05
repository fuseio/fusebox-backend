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
export const getBar = gql`
    query Bar($barId: String!) {
        bar(id: $barId) {
            ratio
            totalSupply
        }
    }
`

export const getBarStats = gql`
    query barStatsQuery($startTimestamp: String!, $days: Int!) {
        bars(first: 1) {
            id
            ratio
            totalSupply
        }
        histories(first: $days, orderDirection: asc, orderBy: id, where: { id_gte: $startTimestamp }) {
            id
            ratio
        }
        voltBalanceHistories(first: $days, orderDirection: asc, orderBy: id, where: { id_gte: $startTimestamp }) {
            id
            balance
            balanceUSD
            totalVoltStaked
        }
    }
`
