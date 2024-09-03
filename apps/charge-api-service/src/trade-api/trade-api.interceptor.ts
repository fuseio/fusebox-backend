import { AxiosRequestConfig, AxiosResponse } from 'axios'
import { ExecutionContext, HttpException, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { catchError, map } from 'rxjs/operators'

import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { isEmpty } from 'lodash'

@Injectable()
export class TradeApiInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TradeApiInterceptor.name)

  constructor (
    private httpService: HttpService,
    private configService: ConfigService
  ) { }

  async intercept (context: ExecutionContext): Promise<any> {
    const requestConfig: AxiosRequestConfig = await this.prepareRequestConfig(context)

    const response = await this.httpService
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

    return response
  }

  private async prepareRequestConfig (context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()

    const ctxClassName = context.getClass().name
    const ctxHandlerName = context.getHandler().name
    const query = request.query
    const params = request.params
    const body = request.body || {}

    // Get the configuration for the relevant API
    const config = this.configService.get<Record<string, any>>(ctxClassName)

    // Replace headers if needed based on the configuration
    const headers: Record<string, any> = {
      'Content-Type': 'application/json'
    }

    // Build the final request configuration
    const requestConfig: AxiosRequestConfig = {
      url: `${config?.baseUrl}/${params[0]}`,
      method: ctxHandlerName,
      headers
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
