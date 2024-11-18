import { gql } from 'graphql-request'

export const getCollectiblesByOwner = gql`
    query getCollectiblesByOwner($address: String!, $first: Int, $skip: Int, $orderBy: String!, $orderDirection: String!) {
        account(id: $address) {
            id
            address
            collectibles(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
                id
                created
                tokenId
                metadata {
                   id
                    description
                    imageURL
                    name
                }
                creator {
                    id
                }
                owner {
                    id
                }
                collection {
                    collectionName
                    collectionSymbol
                    collectionAddress
                }
            }
        }
    }
`
