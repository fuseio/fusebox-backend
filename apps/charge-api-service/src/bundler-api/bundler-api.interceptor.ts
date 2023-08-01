import { HttpService } from '@nestjs/axios'
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  HttpException,
  CallHandler,
  InternalServerErrorException,
  Inject
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { lastValueFrom, Observable } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { isEmpty, capitalize } from 'lodash'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
import { ClientProxy } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'
import { smartWalletsService } from '@app/common/constants/microservices.constants'

@Injectable()
export class BundlerApiInterceptor implements NestInterceptor {
  constructor (
    @Inject(smartWalletsService) private readonly dataLayerClient: ClientProxy,
    private httpService: HttpService,
    private configService: ConfigService
  ) { }

  async intercept (context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
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

    if (requestConfig.data?.method === 'eth_sendUserOperation') {
      const userOp = { ...requestConfig.data.params[0], userOpHash: response?.result }
      try {
        callMSFunction(this.dataLayerClient, 'record-user-op', userOp)
      } catch (error) {
        console.log(error)
      }
    }

    return next.handle().pipe(map(() => response))
  }

  private async prepareRequestConfig (context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    const requestEnvironment = request.environment
    const ctxHandlerName = context.getHandler().name
    const body = request.body
    const requestConfig: AxiosRequestConfig = {
      url: this.prepareUrl(requestEnvironment),
      method: ctxHandlerName
    }

    if (!isEmpty(body)) {
      requestConfig.data = body
    }

    return requestConfig
  }

  private prepareUrl (environment) {
    if (isEmpty(environment)) throw new InternalServerErrorException('Bundler environment is missing')
    const config = this.configService.get(`bundler.${environment}`)

    if (config.url) {
      return config.url
    } else {
      throw new InternalServerErrorException(`${capitalize(environment)} bundler environment is missing`)
    }
  }
}
