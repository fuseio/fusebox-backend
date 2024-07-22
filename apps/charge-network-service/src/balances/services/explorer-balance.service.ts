import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { lastValueFrom, map } from 'rxjs'
import { BalanceService } from '../interfaces/balances.interface'
import GraphQLService from '@app/common/services/graphql.service'
import { getCollectiblesByOwner } from '@app/network-service/common/constants/graph-queries/nfts'

@Injectable()
export class ExplorerService implements BalanceService {
  constructor (
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly graphQLService: GraphQLService
  ) {}

  get explorerBaseUrl () {
    return this.configService.get('explorer.baseUrl')
  }

  get explorerApiKey () {
    return this.configService.get('explorer.apiKey')
  }

  get nftGraphUrl () {
    return this.configService.get('nftGraphUrl')
  }

  async getERC20TokenBalances (address: string) {
    const observable = this.httpService
      .get(`${this.explorerBaseUrl}?module=account&action=tokenlist&address=${address}&apikey=${this.explorerApiKey}`)
      .pipe(map(res => res.data))
    return await lastValueFrom(observable)
  }

  async getERC721TokenBalances (address: string) {
    return this.graphQLService.fetchFromGraphQL(this.nftGraphUrl, getCollectiblesByOwner, { address: address.toLowerCase() })
  }
}
