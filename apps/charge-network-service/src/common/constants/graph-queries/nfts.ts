import { gql } from 'graphql-request'

export const getCollectiblesByOwner = gql`
    query getCollectiblesByOwner($address: String!) {
            account(id: $address) {
                id
                address
                collectibles {
                id
                created
                tokenId
                description
                descriptorUri
                name
                imageURL
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
