import { HttpService } from '@nestjs/axios'
import { HttpException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AxiosRequestConfig } from 'axios'
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

  async getHistoricalTxs (smartWalletAddress, params) {
    const requestUrl = `${this.relayApiUrl}/wallets/actions/${smartWalletAddress}`
    const requestConfig: AxiosRequestConfig = {
      method: 'get',
      url: requestUrl,
      params
    }
    return await this.httpProxy(requestConfig)
  }

  async createWallet (params) {
    const requestUrl = `${this.relayApiUrl}/wallets`
    const name = 'createWallet'
    const requestConfig: AxiosRequestConfig = {
      method: 'post',
      url: requestUrl,
      data: {
        name,
        params
      }
    }
    return await this.httpProxy(requestConfig)
  }

  async relay (params) {
    const requestUrl = `${this.relayApiUrl}/relay`
    const name = 'relay'
    const requestConfig: AxiosRequestConfig = {
      method: 'post',
      url: requestUrl,
      data: {
        name,
        params
      }
    }

    return await this.httpProxy(requestConfig)
  }

  private async httpProxy (requestConfig: AxiosRequestConfig) {
    const observable = this.httpService
      .request(
        requestConfig
      )
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
