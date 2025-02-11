export interface BalanceService {
  getERC20TokenBalances(address: string): Promise<any>;
  getERC721TokenBalances(address: string, limit?: number, cursor?: string): Promise<any>;
}

export interface ExplorerServiceCollectibleResponse {
  contentURI: string
  collection: {
    collectionAddress: string
    collectionName: string
    collectionSymbol: string
  }
  created: string
  creator: { id: string }
  owner: { id: string }
  tokenId: string
  metadata?: {
    id?: string
    description?: string
    imageURL?: string
    name?: string
  }
}

export interface ExplorerServiceGraphQLVariables {
  address: string
  orderBy: string
  orderDirection: string
  first: number
  skip?: number
}

export interface ExplorerServiceTransformedCollectible {
  collection: {
    collectionAddress: string
    collectionName: string
    collectionSymbol: string
  }
  created: string
  creator: { id: string }
  owner: { id: string }
  tokenId: string
  description: string | null
  descriptorUri: string | null
  imageURL: string | null
  name: string | null
  id: string
}
