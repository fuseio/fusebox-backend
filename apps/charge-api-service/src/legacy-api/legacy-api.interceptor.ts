import { ApiKeysService } from '@app/api-service/api-keys/api-keys.service'
import { HttpService } from '@nestjs/axios'
import { Injectable, NestInterceptor, ExecutionContext, HttpException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { lastValueFrom } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { get, isEmpty, includes } from 'lodash'
import { AxiosRequestConfig, AxiosResponse } from 'axios'

@Injectable()
export class LegacyApiInterceptor implements NestInterceptor {
  constructor (
    private apiKeysService: ApiKeysService,
    private httpService: HttpService,
    private configService: ConfigService
  ) { }

  async intercept (context: ExecutionContext): Promise<any> {
    const requestConfig: AxiosRequestConfig = await this.prepareRequestConfig(context)

    const response = await lastValueFrom(this.httpService
      .request(
        requestConfig
      )
      .pipe(
        map((axiosResponse: AxiosResponse) => {
          return axiosResponse.data
        })
      )
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
    )

    return response
  }

  private async prepareRequestConfig (context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()

    const ctxClassName = context.getClass().name
    const ctxHandlerName = context.getHandler().name
    const query = request.query
    const params = request.params
    const body = request.body || {}
    const requestHeaders = request.headers

    // Get the configuration for the relevant Legacy API
    const config = this.configService.get<Record<string, any>>(ctxClassName)

    // Replace headers if needed based on the configuration
    let headers: Record<string, any> = {
      'Content-Type': 'application/json'
    }

    if (config.replaceHeaders) {
      const projectJwt = await this.apiKeysService.getProjectJwt({ publicKey: query?.apiKey })
      headers = {
        Authorization: `Bearer ${projectJwt}`
      }
    } else if (get(requestHeaders, 'authorization')) {
      headers = {
        Authorization: get(requestHeaders, 'authorization')
      }
    }

    if (config.addCommunityAddressForPostRequests &&
      ctxHandlerName === 'post' &&
      isEmpty(body?.communityAddress) &&
      !includes(params, 'images')) {
      const projectId = await this.apiKeysService.getProjectIdByPublicKey(query?.apiKey)
      body.communityAddress = projectId
    }

    // Build the final request configuration
    let requestConfig: AxiosRequestConfig

    // Handle the special case of fetching wallets for Admin API through legacy Wallets API
    if (ctxHandlerName === 'getWallets') {
      const baseUrl = this.configService.get<Record<string, any>>('LegacyWalletApiController')?.baseUrl
      requestConfig = {
        url: `${baseUrl}/wallets/${params[0]}`,
        method: 'get',
        headers
      }
    // Handle the special case of fetching tokens for Admin API through legacy v1 Tokens API
    } else if (ctxHandlerName === 'getTokens') {
      const baseUrl = this.configService.get<Record<string, any>>('LegacyV1ApiUrl')
      requestConfig = {
        url: `${baseUrl}/tokens/${params[0]}`,
        method: 'get',
        headers
      }
    } else {
      requestConfig = {
        url: `${config?.baseUrl}/${params[0]}`,
        method: ctxHandlerName,
        headers
      }
    }

    if (!isEmpty(body)) {
      requestConfig.data = body
    }

    if (!isEmpty(query)) {
      requestConfig.params = query
    }
    return requestConfig
  }
}
