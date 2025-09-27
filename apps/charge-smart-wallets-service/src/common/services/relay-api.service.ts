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
    try {
      const observable = this.httpService
        .request({
          ...requestConfig,
          timeout: 30000 // 30 second timeout
        })
        .pipe(map(res => res.data))
        .pipe(
          catchError(e => {
            const errorReason = e?.response?.data?.error ||
              e?.response?.data?.errors?.message || ''

            // Transform HTTP exceptions to regular errors for microservice context
            if (e.code === 'ECONNABORTED' || e?.response?.status === 504) {
              throw new Error('Service temporarily unavailable, please try again')
            }

            throw new Error(`${e?.response?.statusText || 'Request failed'}: ${errorReason}`)
          })
        )
      return await lastValueFrom(observable)
    } catch (error) {
      // Log error for debugging but don't let it crash the service
      console.error('Relay API error:', error.message)
      throw error
    }
  }
}
