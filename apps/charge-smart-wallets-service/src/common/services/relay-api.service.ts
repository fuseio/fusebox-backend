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

  get relayApiUrl () {
    return this.configService.get('relayApi')
  }

  async createWallet (params) {
    const observable = this.httpService
      .post(`${this.relayApiUrl}/wallets`, { name: 'createWallet', params: { ...params } })
      .pipe(map(res => res.data))
    return await lastValueFrom(observable)
  }

  async relay (params) {
    const observable = this.httpService
      .post(`${this.relayApiUrl}/relay`, { name: 'relay', params: { ...params } })
      .pipe(map(res => res.data))
    return await lastValueFrom(observable)
  }
}
