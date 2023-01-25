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

  async createWallet (data) {
    const observable = this.httpService
      .post(`${this.configService.get('relayApi')}/wallets`, data)
      .pipe(map(res => res.data))
    return await lastValueFrom(observable)
  }

  async relay (data) {
    const observable = this.httpService
      .post(`${this.configService.get('relayApi')}/relay`, data)
      .pipe(map(res => res.data))
    return await lastValueFrom(observable)
  }
}
