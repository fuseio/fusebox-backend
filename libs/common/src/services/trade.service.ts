import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { lastValueFrom, map } from 'rxjs'

@Injectable()
export default class TradeService {
  constructor (
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) { }

  async getTokenPrice (tokenAddress: string) {
    const observable = this.httpService
      .get(`${this.configService.get('tradeApiBaseUrl')}/api/v1/price/${tokenAddress}`)
      .pipe(map(res => res.data.data.price))
    return await lastValueFrom(observable)
  }
}
