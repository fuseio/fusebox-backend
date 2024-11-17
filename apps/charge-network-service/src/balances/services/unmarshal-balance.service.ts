import { Inject, Injectable, Logger } from '@nestjs/common'
import { lastValueFrom, map } from 'rxjs'
import { Cache } from 'cache-manager'
import fetch from 'node-fetch'
import { isEmpty } from 'lodash'

import { BalanceService } from '@app/network-service/balances/interfaces/balances.interface'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { TokenService } from '@app/smart-wallets-service/common/services/token.service'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { logPerformance } from '@app/notifications-service/common/decorators/log-performance.decorator'

interface NFTMetadata {
  image?: string;
  description?: string;
  name?: string;
}

@Injectable()
export class UnmarshalService implements BalanceService {
  private readonly logger = new Logger(UnmarshalService.name)
  private readonly CACHE_TTL = 60000 // 1 minute
  private readonly METADATA_TIMEOUT = 20000
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAY = 1000
  private readonly IPFS_GATEWAYS = [
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://unmarshal.mypinata.cloud/ipfs/'
  ]

  constructor (
    private readonly tokenService: TokenService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  get unmarshalBaseUrl () {
    return this.configService.get('unmarshal.baseUrl')
  }

  get unmarshalApiKey () {
    return this.configService.get('unmarshal.apiKey')
  }

  @logPerformance('UnmarshalService::getERC20TokenBalances')
  async getERC20TokenBalances (address: string) {
    const uri = `${this.unmarshalBaseUrl}/v2/fuse/address/${address}/assets?includeLowVolume=true&auth_key=${this.unmarshalApiKey}`
    const observable = this.httpService
      .get(uri)
      .pipe(map(res => res.data.assets))
    const unmarshalData = await lastValueFrom(observable)
    return this.transformToExplorerFormat(unmarshalData)
  }

  @logPerformance('UnmarshalService::getERC721TokenBalances')
  async getERC721TokenBalances (address: string, limit?: number, cursor?: string) {
    const requestCacheKey = this.generateCacheKey([
      'nft_request',
      address.toLowerCase(),
      (limit || 100).toString(),
      cursor || '0'
    ])
    const cachedRequest = await this.cacheManager.get(requestCacheKey)

    if (cachedRequest) {
      return cachedRequest
    }

    let retries = 0
    while (retries < this.MAX_RETRIES) {
      try {
        let uri = `${this.unmarshalBaseUrl}/v3/fuse/address/${address}/nft-assets?includeLowVolume=true&auth_key=${this.unmarshalApiKey}`
        const pageSize = Math.min(limit || 100, 100)
        uri += `&pageSize=${pageSize}`

        if (cursor) {
          const decodedCursor = Buffer.from(cursor, 'base64').toString('ascii')
          uri += `&offset=${decodedCursor}`
        }

        const unmarshalData = await lastValueFrom(
          this.httpService.get(uri, {
            timeout: this.METADATA_TIMEOUT,
            validateStatus: status => status < 500
          }).pipe(map(res => res.data))
        )

        if (!unmarshalData || !unmarshalData.nft_assets) {
          const emptyResponse = {
            nextCursor: null,
            data: { account: { id: address, address, collectibles: [] } }
          }
          await this.cacheManager.set(requestCacheKey, emptyResponse, this.CACHE_TTL)
          return emptyResponse
        }

        const transformedCollectibles = isEmpty(unmarshalData.nft_assets)
          ? []
          : await this.transformCollectibles(unmarshalData.nft_assets)

        const result = {
          nextCursor: unmarshalData.next_offset
            ? Buffer.from(unmarshalData.next_offset + '').toString('base64')
            : null,
          data: {
            account: {
              id: address,
              address,
              collectibles: transformedCollectibles
            }
          }
        }

        // Cache the full response
        await this.cacheManager.set(requestCacheKey, result, this.CACHE_TTL)
        return result
      } catch (error) {
        retries++
        if (retries === this.MAX_RETRIES) {
          this.logger.error(`Failed to fetch NFTs from Unmarshal after ${this.MAX_RETRIES} retries: ${error.message}`)
          throw error
        }
        this.logger.warn(`Retry ${retries}/${this.MAX_RETRIES} for address ${address}`)
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY))
      }
    }
  }

  private transformToExplorerFormat (unmarshalData: any) {
    if (isEmpty(unmarshalData)) {
      return {
        message: 'No tokens found',
        result: [],
        status: '0'
      }
    }

    return {
      message: 'OK',
      result: unmarshalData.map(asset => ({
        balance: asset.balance,
        contractAddress: asset.contract_address,
        decimals: asset.contract_decimals.toString(),
        name: asset.contract_name,
        symbol: asset.contract_ticker_symbol,
        type: asset.contract_address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
          ? 'native'
          : asset.type === 'ERC20'
            ? 'ERC-20'
            : asset.type
      })),
      status: '1'
    }
  }

  @logPerformance('UnmarshalService::transformCollectibles')
  private async transformCollectibles (assets: any[]) {
    const batchSize = 10
    const batches = []

    for (let i = 0; i < assets.length; i += batchSize) {
      batches.push(assets.slice(i, i + batchSize))
    }

    const results = []
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(asset => this.processAsset(asset))
      )
      results.push(...batchResults)
    }

    return results
  }

  private async processAsset (asset: any) {
    const descriptorUri = this.transformDescriptorUri(asset.external_link)
    const id = this.generateId(asset.asset_contract, asset.token_id)

    const symbolCacheKey = this.generateCacheKey(['collection_symbol', asset.asset_contract])
    let collectionSymbol = await this.cacheManager.get(symbolCacheKey)

    if (!collectionSymbol) {
      collectionSymbol = asset.asset_contract_ticker_symbol || ''
      if (!collectionSymbol) {
        try {
          const tokenDetails = await this.tokenService.fetchTokenDetails(asset.asset_contract)
          collectionSymbol = tokenDetails.symbol
          await this.cacheManager.set(symbolCacheKey, collectionSymbol, this.CACHE_TTL)
        } catch (error) {
          this.logger.error(`Error fetching token symbol: ${error.message}`)
          collectionSymbol = ''
        }
      }
    }

    const collectible = {
      collection: {
        collectionAddress: asset.asset_contract,
        collectionName: asset.asset_contract_name,
        collectionSymbol
      },
      created: asset.minted_at.toString(),
      creator: { id: asset.creator },
      description: asset.description,
      descriptorUri,
      id,
      imageURL: descriptorUri?.includes('nft.voltage.finance')
        ? descriptorUri
        : asset.issuer_specific_data.image_url,
      name: asset.issuer_specific_data.name,
      owner: { id: asset.owner },
      tokenId: asset.token_id
    }

    if (descriptorUri && !collectible.imageURL) {
      const metadataCacheKey = this.generateCacheKey(['nft_metadata', descriptorUri])
      const cachedMetadata = await this.cacheManager.get<NFTMetadata>(metadataCacheKey)

      if (cachedMetadata) {
        collectible.imageURL = cachedMetadata.image || ''
        collectible.description = cachedMetadata.description || ''
      } else {
        try {
          const metadata = await this.fetchMetadataWithTimeout(descriptorUri)
          if (metadata) {
            collectible.imageURL = metadata.image?.startsWith('ipfs://')
              ? `https://ipfs.io/ipfs/${metadata.image.split('://')[1]}`
              : metadata.image || ''
            collectible.description = metadata.description || ''
            await this.cacheManager.set(metadataCacheKey, metadata, this.CACHE_TTL)
          }
        } catch (error) {
          this.logger.error(`Error fetching metadata: ${error.message}`)
        }
      }
    }

    return collectible
  }

  @logPerformance('UnmarshalService::fetchMetadataWithTimeout')
  private async fetchMetadataWithTimeout (uri: string) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.METADATA_TIMEOUT)

    try {
      if (uri.includes('/ipfs/')) {
        const cid = uri.split('/ipfs/')[1]
        for (const gateway of this.IPFS_GATEWAYS) {
          try {
            const response = await fetch(`${gateway}${cid}`, {
              signal: controller.signal,
              headers: {
                Accept: 'application/json'
              }
            })

            if (!response.ok) {
              continue
            }

            const text = await response.text()
            try {
              const metadata = JSON.parse(text)
              return metadata
            } catch {
              continue
            }
          } catch {
            continue
          }
        }
        throw new Error('All IPFS gateways failed')
      }

      // For non-IPFS URIs
      const response = await fetch(uri, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      try {
        const metadata = JSON.parse(text)
        return metadata
      } catch (e) {
        throw new Error(`Invalid JSON: ${text.substring(0, 50)}...`)
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private transformDescriptorUri (externalLink: string): string {
    if (!externalLink) {
      return null
    }

    if (!externalLink.includes('.json') && externalLink.startsWith('https://unmarshal.mypinata.cloud/ipfs/')) {
      return `ipfs://${externalLink.split('/').pop()}`
    }

    return this.isBase64(externalLink)
      ? `data:application/json;base64,${externalLink}`
      : externalLink
  }

  private generateId (contractAddress: string, tokenId: string): string {
    try {
      const tokenNum = BigInt(tokenId)
      const hexTokenId = tokenNum.toString(16).padStart(4, '0')
      return `${contractAddress}-0x${hexTokenId}`
    } catch {
      return `${contractAddress}-invalid-${tokenId}`
    }
  }

  private isBase64 (str: string): boolean {
    if (!str) {
      return false
    }

    try {
      return btoa(atob(str)) === str
    } catch (err) {
      return false
    }
  }

  private generateCacheKey (parts: string[]): string {
    return parts.map(p => encodeURIComponent(p)).join(':')
  }
}
