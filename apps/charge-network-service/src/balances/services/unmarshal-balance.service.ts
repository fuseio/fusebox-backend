import { Injectable, Logger } from '@nestjs/common'
import { lastValueFrom, map } from 'rxjs'

import { BalanceService } from '@app/network-service/balances/interfaces/balances.interface'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { isEmpty } from 'lodash'

@Injectable()
export class UnmarshalService implements BalanceService {
  private readonly logger = new Logger(UnmarshalService.name)

  constructor (
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  get unmarshalBaseUrl () {
    return this.configService.get('unmarshal.baseUrl')
  }

  get unmarshalApiKey () {
    return this.configService.get('unmarshal.apiKey')
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

  private transformToNFTSubgraphFormat (nftAssets: any) {
    return {
      data: {
        account: {
          id: nftAssets[0]?.owner || '',
          address: nftAssets[0]?.owner || '',
          collectibles: nftAssets.map(asset => ({
            collection: {
              collectionAddress: asset.asset_contract,
              collectionName: asset.asset_contract_name,
              collectionSymbol: asset.type
            },
            created: asset.minted_at.toString(),
            creator: {
              id: asset.creator
            },
            description: asset.description,
            descriptorUri: this.isBase64(asset.external_link)
              ? `data:application/json;base64,${asset.external_link}`
              : asset.external_link,
            id: `${asset.asset_contract}-${asset.token_id}`,
            imageURL: asset.issuer_specific_data.image_url,
            name: asset.issuer_specific_data.name,
            owner: {
              id: asset.owner
            },
            tokenId: asset.token_id
          }))
        }
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

    const data = this.transformToNFTSubgraphFormat(unmarshalData.nft_assets)
    const nextCursor = unmarshalData.next_offset
      ? Buffer.from(unmarshalData.next_offset + '').toString('base64')
      : null

    return {
      nextCursor,
      ...data
    }
  }
}
