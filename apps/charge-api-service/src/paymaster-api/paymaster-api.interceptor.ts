import { HttpService } from '@nestjs/axios'
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  HttpException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { lastValueFrom } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { isEmpty } from 'lodash'
import { AxiosRequestConfig, AxiosResponse } from 'axios'

@Injectable()
export class PaymasterApiInterceptor implements NestInterceptor {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) { }

  async intercept(context: ExecutionContext): Promise<any> {
    const requestConfig: AxiosRequestConfig = await this.prepareRequestConfig(
      context
    )

    const response = await lastValueFrom(
      this.httpService
        .request(requestConfig)
        .pipe(
          map((axiosResponse: AxiosResponse) => {
            return axiosResponse.data
          })
        )
        .pipe(
          catchError((e) => {
            const errorReason =
              e?.response?.data?.error ||
              e?.response?.data?.errors?.message ||
              ''

            throw new HttpException(
              `${e?.response?.statusText}: ${errorReason}`,
              e?.response?.status
            )
          })
        )
    )

    return response
  }

  private async prepareRequestConfig(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()

    const ctxClassName = context.getClass().name
    const ctxHandlerName = context.getHandler().name
    const query = request.query
    const config = this.configService.get<Record<string, any>>(ctxClassName)

    const requestConfig: AxiosRequestConfig = {
      url: `${config?.baseUrl}`,
      method: ctxHandlerName
    }

    if (!isEmpty(query)) {
      requestConfig.params = query
    }

    return requestConfig
  }
}
