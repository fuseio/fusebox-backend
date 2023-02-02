import { HttpService } from '@nestjs/axios'
import { HttpException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { catchError, lastValueFrom, map } from 'rxjs'

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
    const requestUrl = `${this.relayApiUrl}/wallets`
    const methodName = 'createWallet'
    return await this.httpProxy(requestUrl, methodName, params)
  }

  async relay (params) {
    const requestUrl = `${this.relayApiUrl}/relay`
    const methodName = 'relay'
    return await this.httpProxy(requestUrl, methodName, params)
  }

  private async httpProxy(requestUrl: string, methodName: string, params: any) {
    const observable = this.httpService
      .post(requestUrl, { name: methodName, params: { ...params } })
      .pipe(map(res => res.data))
      .pipe(
        catchError(e => {
          const errorReason = e?.response?.data?.error ||
            e?.response?.data?.errors?.message || ''

          throw new HttpException(
            `${e?.response?.statusText}: ${errorReason}`,
            e?.response?.status
          )
        })
      )
    return await lastValueFrom(observable)
  }
}
