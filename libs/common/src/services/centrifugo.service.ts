import { HttpService } from '@nestjs/axios'
import { HttpException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { catchError, lastValueFrom, map } from 'rxjs'

@Injectable()
export default class CentrifugoAPIService {
  constructor (
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) { }

  get centrifugoBaseUrl () {
    return this.configService.get('centrifugoBaseUrl')
  }

  get centrifugoApiKey () {
    return this.configService.get('centrifugoApiKey')
  }

  async unsubscribe (channel: string, user: string) {
    const observable = this.httpService
      .post(`${this.centrifugoBaseUrl}/unsubscribe`, {
        channel, user
      },
      { headers: { 'X-API-Key': this.centrifugoApiKey } })
      .pipe(map(res => res.data))
      .pipe(
        catchError(e => {
          throw new HttpException(
            `${e?.response?.message}`,
            e?.response?.code
          )
        })
      )
    return await lastValueFrom(observable)
  }

  async subscribe (channel: string, user: string) {
    const observable = this.httpService
      .post(`${this.centrifugoBaseUrl}/subscribe`, {
        channel, user
      },
      { headers: { 'X-API-Key': this.centrifugoApiKey } })
      .pipe(map(res => res.data))
      .pipe(
        catchError(e => {
          throw new HttpException(
            `${e?.response?.message}`,
            e?.response?.code
          )
        })
      )
    return await lastValueFrom(observable)
  }

  async publish (channel: string, data: Record<string, any>) {
    const observable = this.httpService
      .post(`${this.centrifugoBaseUrl}/publish`, {
        channel, data
      },
      { headers: { 'X-API-Key': this.centrifugoApiKey } })
      .pipe(map(res => res.data)).pipe(
        catchError(e => {
          throw new HttpException(
            `${e?.response?.message}`,
            e?.response?.code
          )
        })
      )
    return await lastValueFrom(observable)
  }
}
