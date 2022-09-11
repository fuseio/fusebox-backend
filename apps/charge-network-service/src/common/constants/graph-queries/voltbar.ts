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
