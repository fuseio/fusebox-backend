import { Injectable, Logger } from '@nestjs/common'
import { lastValueFrom, map } from 'rxjs'

import { BalanceService } from '@app/network-service/balances/interfaces/balances.interface'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { TokenService } from '@app/smart-wallets-service/common/services/token.service'
import fetch from 'node-fetch'
import { isEmpty } from 'lodash'

@Injectable()
export class UnmarshalService implements BalanceService {
  private readonly logger = new Logger(UnmarshalService.name)

  constructor (
    private readonly tokenService: TokenService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  get unmarshalBaseUrl () {
    return this.configService.get('unmarshal.baseUrl')
  }

  get unmarshalApiKey () {
    return this.configService.get('unmarshal.apiKey')
  }

  async getERC20TokenBalances (address: string) {
    const uri = `${this.unmarshalBaseUrl}/v2/fuse/address/${address}/assets?includeLowVolume=true&auth_key=${this.unmarshalApiKey}`
    const observable = this.httpService
      .get(uri)
      .pipe(map(res => res.data.assets))
    const unmarshalData = await lastValueFrom(observable)
    return this.transformToExplorerFormat(unmarshalData)
  }

  async getERC721TokenBalances (address: string, limit?: number, cursor?: string) {
    let uri = `${this.unmarshalBaseUrl}/v3/fuse/address/${address}/nft-assets?includeLowVolume=true&auth_key=${this.unmarshalApiKey}`

    const pageSize = Math.min(limit || 100, 100) // Ensure we don't exceed Unmarshal's limit
    uri += `&pageSize=${pageSize}`

    if (cursor) {
      const decodedCursor = Buffer.from(cursor, 'base64').toString('ascii')
      uri += `&offset=${decodedCursor}`
    }

    const observable = this.httpService
      .get(uri)
      .pipe(map(res => res.data))
    const unmarshalData = await lastValueFrom(observable)

    const transformedCollectibles = isEmpty(unmarshalData.nft_assets)
      ? []
      : await Promise.all(
        unmarshalData.nft_assets.map(asset => this.transformCollectible(asset))
      )

    const data = {
      data: {
        account: {
          id: address,
          address,
          collectibles: transformedCollectibles
        }
      }
    }

    if (!isEmpty(transformedCollectibles)) {
      await this.fetchAndApplyMetadata(data.data.account.collectibles)
    }

    const nextCursor = unmarshalData.next_offset
      ? Buffer.from(unmarshalData.next_offset + '').toString('base64')
      : null

    return {
      nextCursor,
      ...data
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

  private async fetchAndApplyMetadata (collectibles: any[]) {
    const fetchPromises = collectibles.map(async (collectible) => {
      if (!collectible.descriptorUri) {
        return
      }

      try {
        if (collectible.descriptorUri.endsWith('.json')) {
          const response = await fetch(collectible.descriptorUri)
          const metadata = await response.json()
          collectible.imageURL = `https://ipfs.io/ipfs/${metadata.image.split('://')[1]}`
        } else if (collectible.descriptorUri.startsWith('ipfs://')) {
          const ipfsHash = collectible.descriptorUri.split('://')[1]
          const response = await fetch(`https://unmarshal.mypinata.cloud/ipfs/${ipfsHash}`)
          const metadata = await response.json()
          if (metadata.image) {
            collectible.imageURL = metadata.image.startsWith('ipfs://')
              ? `https://ipfs.io/ipfs/${metadata.image.split('://')[1]}`
              : metadata.image
          }
        }
      } catch (error) {
        this.logger.error(`Error fetching metadata: ${error.message}`)
      }
    })

    await Promise.all(fetchPromises)
  }

  private async transformCollectible (asset: any) {
    const descriptorUri = this.transformDescriptorUri(asset.external_link)
    const id = this.generateId(asset.asset_contract, asset.token_id)

    const collectionSymbol = await this.fetchCollectionSymbol(asset.asset_contract)

    return {
      collection: {
        collectionAddress: asset.asset_contract,
        collectionName: asset.asset_contract_name,
        collectionSymbol
      },
      created: asset.minted_at.toString(),
      creator: {
        id: asset.creator
      },
      description: asset.description,
      descriptorUri,
      id,
      imageURL: descriptorUri.includes('nft.voltage.finance') ? descriptorUri : asset.issuer_specific_data.image_url,
      name: asset.issuer_specific_data.name,
      owner: {
        id: asset.owner
      },
      tokenId: asset.token_id
    }
  }

  private async fetchCollectionSymbol (contractAddress: string): Promise<string> {
    try {
      const tokenDetails = await this.tokenService.fetchTokenDetails(contractAddress)
      return tokenDetails.symbol
    } catch (error) {
      this.logger.error(`Error fetching token symbol: ${error.message}`)
      return ''
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
    const hexTokenId = parseInt(tokenId).toString(16).padStart(4, '0')
    return `${contractAddress}-0x${hexTokenId}`
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
}
