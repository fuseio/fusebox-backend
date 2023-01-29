import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { lastValueFrom, map } from 'rxjs'

@Injectable()
export default class RelayAPIService {
  constructor (
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) { }

  async createWallet (params) {
    const observable = this.httpService
      .post(`${this.configService.get('relayApi')}/wallets`, { name: 'createWallet', params: { ...params } })
      .pipe(map(res => res.data))
    return await lastValueFrom(observable)
  }

  async relay (params) {
    const observable = this.httpService
      .post(`${this.configService.get('relayApi')}/relay`, { name: 'relay', params: { ...params } })
      .pipe(map(res => res.data))
    return await lastValueFrom(observable)
  }
}
