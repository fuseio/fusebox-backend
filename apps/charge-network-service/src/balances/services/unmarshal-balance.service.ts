import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { lastValueFrom, map } from 'rxjs'
import { BalanceService } from '../interfaces/balances.interface'

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
    try {
      return btoa(atob(str)) === str
    } catch (err) {
      return false
    }
  }

  private transformToNFTSubgraphFormat (unmarshalData: any) {
    return {
      data: {
        account: {
          address: unmarshalData[0]?.owner || '',
          collectibles: unmarshalData.map(asset => ({
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
    return {
      message: 'OK',
      result: unmarshalData.map(asset => ({
        balance: asset.balance,
        contractAddress: asset.contract_address,
        decimals: asset.contract_decimals.toString(),
        name: asset.contract_name,
        symbol: asset.contract_ticker_symbol,
        type: asset.type === 'ERC20' ? 'ERC-20' : asset.type
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

  async getERC721TokenBalances (address: string) {
    const uri = `${this.unmarshalBaseUrl}/v3/fuse/address/${address}/nft-assets?includeLowVolume=true&auth_key=${this.unmarshalApiKey}`
    const observable = this.httpService
      .get(uri)
      .pipe(map(res => res.data.nft_assets))
    const unmarshalData = await lastValueFrom(observable)
    return this.transformToNFTSubgraphFormat(unmarshalData)
  }
}
