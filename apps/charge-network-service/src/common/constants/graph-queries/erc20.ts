import { gql } from 'graphql-request'

export const getERC20TokensQuery = gql`
  query getAccountBalances($address: ID!, $first: Int!, $skip: Int!) {
    accounts(where: {id: $address}) {
      balances(first: $first, skip: $skip) {
        token {
          decimals
          name
          id
          symbol
        }
        amount
      }
    }
  }
`
