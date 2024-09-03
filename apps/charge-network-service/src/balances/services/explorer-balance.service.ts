import { Injectable, Logger } from '@nestjs/common'
import { lastValueFrom, map } from 'rxjs'

import { BalanceService } from '@app/network-service/balances/interfaces/balances.interface'
import { ConfigService } from '@nestjs/config'
import GraphQLService from '@app/common/services/graphql.service'
import { HttpService } from '@nestjs/axios'
import { NATIVE_FUSE_TOKEN } from '@app/smart-wallets-service/common/constants/fuseTokenInfo'
import { ethers } from 'ethers'
import { getCollectiblesByOwner } from '@app/network-service/common/constants/graph-queries/nfts'
import { isEmpty } from 'lodash'

@Injectable()
export class ExplorerService implements BalanceService {
  private readonly logger = new Logger(ExplorerService.name)
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

  get rpcUrl () {
    return this.configService.get('rpcConfig.rpc.url')
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

  async getERC20TokenBalances (address: string) {
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

  async getERC721TokenBalances (address: string, limit?: number, cursor?: string) {
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

    const data = await this.graphQLService.fetchFromGraphQL(this.nftGraphUrl, query, variables)
    const collectibles = data?.data?.account?.collectibles || []
    const nextCursor = isEmpty(collectibles)
      ? null
      : collectibles.length === variables.first
        ? Buffer.from((variables.skip || 0) + collectibles.length + '').toString('base64')
        : null

    return {
      nextCursor,
      ...data
    }
  }

  async getTransactionInfo (transactionHash: string) {
    const observable = this.httpService
      .get(`${this.explorerBaseUrl}/v2/transactions/${transactionHash}`)
      .pipe(map(res => res.data))
    return lastValueFrom(observable)
  }
}
