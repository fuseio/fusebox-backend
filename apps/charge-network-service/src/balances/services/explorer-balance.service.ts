import { Injectable, Logger } from '@nestjs/common'
import { BalanceService } from '@app/network-service/balances/interfaces/balances.interface'
import { ConfigService } from '@nestjs/config'
import GraphQLService from '@app/common/services/graphql.service'
import { NATIVE_FUSE_TOKEN } from '@app/smart-wallets-service/common/constants/fuseTokenInfo'
import { ethers, Contract } from 'ethers'
import { getCollectiblesByOwner } from '@app/network-service/common/constants/graph-queries/nfts-v3'
import { isEmpty } from 'lodash'
import { ExplorerServiceCollectibleResponse, ExplorerServiceGraphQLVariables, ExplorerServiceTransformedCollectible } from '../interfaces/balances.interface'
import MultiCallAbi from '@app/network-service/common/constants/abi/MultiCall'
import Erc20Abi from '@app/network-service/common/constants/abi/Erc20.json'
import { getERC20TokensQuery } from '@app/network-service/common/constants/graph-queries/erc20'

@Injectable()
export class ExplorerService implements BalanceService {
  private readonly logger = new Logger(ExplorerService.name)
  constructor (
    private readonly configService: ConfigService,
    private readonly graphQLService: GraphQLService
  ) { }

  get nftGraphUrl () {
    return this.configService.get('nftGraphUrl')
  }

  get rpcUrl () {
    return this.configService.get('rpcConfig.rpc.url')
  }

  get erc20SubgraphUrl () {
    return this.configService.get('erc20SubgraphUrl')
  }

  get multiCallAddress () {
    return this.configService.get('multiCallAddress')
  }

  private async getNativeTokenBalance (address: string) {
    const provider = new ethers.providers.JsonRpcProvider(this.rpcUrl)
    const balance = await provider.getBalance(address)

    if (balance.eq(0)) {
      return []
    }

    return [
      {
        balance: balance.toString(),
        contractAddress: NATIVE_FUSE_TOKEN.address.toLowerCase(),
        decimals: '18',
        name: 'Fuse',
        symbol: 'FUSE',
        type: 'native'
      }
    ]
  }

  private async fetchAllTokensFromSubgraph (address: string) {
    const PAGE_SIZE = 100
    const allBalances: any[] = []
    let skip = 0

    while (true) {
      const subgraphData = await this.graphQLService.fetchFromGraphQL(
        this.erc20SubgraphUrl,
        getERC20TokensQuery,
        { address: address.toLowerCase(), first: PAGE_SIZE, skip }
      )

      const accounts = subgraphData?.data?.accounts || []
      if (accounts.length === 0 || !accounts[0]?.balances?.length) {
        break
      }

      const balances = accounts[0].balances
      allBalances.push(...balances)

      if (balances.length < PAGE_SIZE) {
        break
      }
      skip += PAGE_SIZE
    }

    return allBalances
  }

  async getERC20TokenBalances (address: string) {
    const nativeTokenBalance = await this.getNativeTokenBalance(address)

    // Fetch all tokens from ERC20 subgraph (paginated)
    const tokenBalances = await this.fetchAllTokensFromSubgraph(address)

    if (tokenBalances.length === 0) {
      if (nativeTokenBalance.length === 0) {
        return { message: 'No tokens found', result: [], status: '0' }
      }
      return { message: 'OK', result: [...nativeTokenBalance], status: '1' }
    }

    const tokenAddresses = tokenBalances.map((b: any) => b.token.id)

    // Use multicall to batch balanceOf calls
    const provider = new ethers.providers.JsonRpcProvider(this.rpcUrl)
    const multiCallContract = new Contract(this.multiCallAddress, MultiCallAbi, provider)
    const erc20Interface = new ethers.utils.Interface(Erc20Abi)

    const encodedCalls = tokenAddresses.map((tokenAddress: string) => ({
      target: tokenAddress,
      callData: erc20Interface.encodeFunctionData('balanceOf', [address])
    }))

    const [, results] = await multiCallContract.aggregate(encodedCalls)

    // Map results and filter out zero balances
    const erc20Tokens = tokenBalances
      .map((tokenBalance: any, index: number) => {
        const balance = erc20Interface.decodeFunctionResult('balanceOf', results[index])[0]
        return {
          balance: balance.toString(),
          contractAddress: tokenBalance.token.id.toLowerCase(),
          decimals: tokenBalance.token.decimals,
          name: tokenBalance.token.name,
          symbol: tokenBalance.token.symbol,
          type: 'ERC-20'
        }
      })
      .filter((token: any) => token.balance !== '0')

    const allTokens = [...nativeTokenBalance, ...erc20Tokens]
    if (allTokens.length === 0) {
      return { message: 'No tokens found', result: [], status: '0' }
    }

    return { message: 'OK', result: allTokens, status: '1' }
  }

  async getERC721TokenBalances (address: string, limit?: number, cursor?: string) {
    const query = getCollectiblesByOwner
    const variables: ExplorerServiceGraphQLVariables = {
      address: address.toLowerCase(),
      orderBy: 'created',
      orderDirection: 'desc',
      first: Math.min(limit || 100, 100)
    }

    if (cursor) {
      variables.skip = parseInt(Buffer.from(cursor, 'base64').toString('ascii'), 10)
    }

    const data = await this.graphQLService.fetchFromGraphQL(this.nftGraphUrl, query, variables)

    if (!data?.data?.account) {
      return {
        nextCursor: null,
        data: {
          account: { address, id: address, collectibles: [] }
        }
      }
    }

    const collectibles = data?.data?.account?.collectibles || []

    const transformedCollectibles = collectibles.map((collectible: ExplorerServiceCollectibleResponse): ExplorerServiceTransformedCollectible => ({
      collection: collectible?.collection,
      created: collectible?.created,
      creator: collectible?.creator,
      owner: collectible?.owner,
      tokenId: collectible?.tokenId,
      description: collectible?.metadata?.description ?? null,
      descriptorUri: collectible?.contentURI ?? null,
      imageURL: collectible?.metadata?.imageURL ?? null,
      name: collectible?.metadata?.name ?? null,
      id: collectible?.tokenId && collectible?.collection?.collectionAddress
        ? `${collectible.collection.collectionAddress}-0x${BigInt(collectible.tokenId).toString(16)}`
        : null
    }))

    const nextCursor = isEmpty(collectibles)
      ? null
      : collectibles.length === variables.first
        ? Buffer.from(`${(variables.skip || 0) + collectibles.length}`).toString('base64')
        : null

    return {
      nextCursor,
      data: {
        account: {
          address,
          id: address,
          collectibles: transformedCollectibles
        }
      }
    }
  }
}
