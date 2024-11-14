import { Inject, Injectable, Logger } from '@nestjs/common'
import { lastValueFrom, map } from 'rxjs'
import { Cache } from 'cache-manager'

import { BalanceService } from '@app/network-service/balances/interfaces/balances.interface'
import { ConfigService } from '@nestjs/config'
import GraphQLService from '@app/common/services/graphql.service'
import { HttpService } from '@nestjs/axios'
import { getCollectiblesByOwner } from '@app/network-service/common/constants/graph-queries/nfts'
import { isEmpty } from 'lodash'
import { CACHE_MANAGER } from '@nestjs/cache-manager'

interface NFTMetadata {
  image?: string;
  description?: string;
  name?: string;
}

@Injectable()
export class ExplorerService implements BalanceService {
  private readonly logger = new Logger(ExplorerService.name)
  private readonly CACHE_TTL = 60000
  private readonly METADATA_TIMEOUT = 20000
  private readonly IPFS_GATEWAYS = [
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://unmarshal.mypinata.cloud/ipfs/'
  ]

  constructor(
    private readonly graphQLService: GraphQLService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpService: HttpService
  ) { }

  get nftGraphUrl() {
    return this.configService.get('nftGraphUrl')
  }

  get explorerBaseUrl() {
    return this.configService.get('explorer.baseUrl')
  }

  get explorerApiKey() {
    return this.configService.get('explorer.apiKey')
  }

  async getERC721TokenBalances(address: string, limit?: number, cursor?: string) {
    const cacheKey = this.generateCacheKey([
      'nft_balances',
      address.toLowerCase(),
      (limit || 100).toString(),
      cursor || 'start'
    ])
    const cachedData = await this.cacheManager.get(cacheKey)

    if (cachedData) {
      return cachedData
    }

    const query = getCollectiblesByOwner
    const variables: any = {
      address: address.toLowerCase(),
      orderBy: 'created',
      orderDirection: 'desc',
      first: Math.min(limit || 100, 100)
    }

    if (cursor) {
      variables.skip = parseInt(Buffer.from(cursor, 'base64').toString('ascii'), 10)
    }

    try {
      if (!this.nftGraphUrl) {
        throw new Error('NFT Graph URL not configured')
      }

      const data = await Promise.race([
        this.graphQLService.fetchFromGraphQL(this.nftGraphUrl, query, variables),
        new Promise((_resolve, reject) =>
          setTimeout(() => reject(new Error('GraphQL timeout')), this.METADATA_TIMEOUT)
        )
      ])

      if (!data || !data.data) {
        return {
          nextCursor: null,
          data: { account: { id: address, address, collectibles: [] } }
        }
      }

      const collectibles = data?.data?.account?.collectibles || []
      const processedCollectibles = await this.processCollectiblesInBatches(collectibles)

      if (data?.data?.account) {
        data.data.account.collectibles = processedCollectibles
      }

      const nextCursor = isEmpty(collectibles)
        ? null
        : collectibles.length === variables.first
          ? Buffer.from((variables.skip || 0) + collectibles.length + '').toString('base64')
          : null

      const result = {
        nextCursor,
        ...data
      }

      await this.cacheManager.set(cacheKey, result, this.CACHE_TTL)
      return result
    } catch (error) {
      this.logger.error(`Failed to fetch NFTs: ${error.message}`)
      throw error
    }
  }

  private async processCollectiblesInBatches(collectibles: any[]) {
    const batchSize = 10
    const batches = []

    for (let i = 0; i < collectibles.length; i += batchSize) {
      batches.push(collectibles.slice(i, i + batchSize))
    }

    const processedCollectibles = []
    for (const batch of batches) {
      const batchResults = await Promise.allSettled(
        batch.map(collectible => this.processCollectible(collectible))
      )
      processedCollectibles.push(...batchResults
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map(r => r.value))
    }

    return processedCollectibles
  }

  private async processCollectible(collectible: any) {
    try {
      if (collectible.descriptorUri && (!collectible.imageURL || !collectible.description)) {
        const metadataCacheKey = this.generateCacheKey(['nft_metadata', collectible.descriptorUri])
        const cachedMetadata = await this.cacheManager.get<NFTMetadata>(metadataCacheKey)

        if (cachedMetadata) {
          collectible.imageURL = cachedMetadata.image || ''
          collectible.description = cachedMetadata.description || ''
        } else {
          try {
            const metadata = await this.fetchMetadataWithTimeout(collectible.descriptorUri)
            if (metadata) {
              if (metadata.image) {
                collectible.imageURL = metadata.image.startsWith('ipfs://')
                  ? `https://ipfs.io/ipfs/${metadata.image.split('://')[1]}`
                  : metadata.image
              }
              if (metadata.description) {
                collectible.description = metadata.description
              }
              await this.cacheManager.set(metadataCacheKey, metadata, this.CACHE_TTL)
            }
          } catch (error) {
            this.logger.error(`Error fetching metadata: ${error.message}`)
          }
        }
      }

      collectible.description = collectible.description || ''
      collectible.imageURL = collectible.imageURL || ''

      return collectible
    } catch (error) {
      this.logger.error(`Error processing collectible: ${error.message}`)
      return {
        ...collectible,
        description: collectible.description || '',
        imageURL: collectible.imageURL || ''
      }
    }
  }

  private async fetchMetadataWithTimeout(uri: string, timeout = 5000): Promise<NFTMetadata> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      if (uri.includes('/ipfs/')) {
        const cid = uri.split('/ipfs/')[1]
        for (const gateway of this.IPFS_GATEWAYS) {
          try {
            const response = await fetch(`${gateway}${cid}`, {
              signal: controller.signal,
              headers: { Accept: 'application/json' }
            })

            if (!response.ok) continue

            const text = await response.text()
            try {
              const metadata = JSON.parse(text)
              clearTimeout(timeoutId)
              return metadata
            } catch {
              continue // Try next gateway if JSON parsing fails
            }
          } catch {
            continue // Try next gateway if fetch fails
          }
        }
        throw new Error('All IPFS gateways failed')
      }

      const response = await fetch(uri, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      try {
        const metadata = JSON.parse(text)
        clearTimeout(timeoutId)
        return metadata
      } catch (e) {
        throw new Error(`Invalid JSON: ${text.substring(0, 50)}...`)
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async getERC20TokenBalances(address: string) {
    const nativeTokenBalance = await this.getNativeTokenBalance(address)
    const observable = this.httpService
      .get(`${this.explorerBaseUrl}?module=account&action=tokenlist&address=${address}&apikey=${this.explorerApiKey}`)
      .pipe(map(res => res.data))
    const data = await lastValueFrom(observable)

    const erc20Tokens = data.result.filter((token: any) => token.type === 'ERC-20')

    return {
      message: data.message,
      result: [...nativeTokenBalance, ...erc20Tokens],
      status: data.status
    }
  }


  private async getNativeTokenBalance(address: string) {
    const observable = this.httpService
      .get(`${this.explorerBaseUrl}?module=account&action=balance&address=${address}&apikey=${this.explorerApiKey}`)
      .pipe(map(res => res.data))
    const data = await lastValueFrom(observable)

    return [{
      balance: data.result,
      contractAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      decimals: '18',
      name: 'Fuse',
      symbol: 'FUSE',
      type: 'native'
    }]
  }

  private generateCacheKey(parts: string[]): string {
    return parts.map(p => encodeURIComponent(p)).join(':')
  }
}
