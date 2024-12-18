import { HttpService } from '@nestjs/axios'
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  HttpException,
  CallHandler,
  InternalServerErrorException,
  Inject,
  HttpStatus,
  Logger
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { lastValueFrom, Observable } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { isEmpty, capitalize, isNil } from 'lodash'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
import { ClientProxy } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'
import { smartWalletsService } from '@app/common/constants/microservices.constants'

@Injectable()
export class BundlerApiInterceptorV1 implements NestInterceptor {
  private readonly logger = new Logger(BundlerApiInterceptorV1.name)
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
            this.logger.log(`BundlerApiInterceptor succeeded: ${JSON.stringify(axiosResponse.data)}`)
            return axiosResponse.data
          })
        )
        .pipe(
          catchError((e) => {
            const errorReason =
              e?.response?.data?.error ||
              e?.response?.data?.errors?.message ||
              ''
            this.logger.log(`BundlerApiInterceptor error: ${JSON.stringify(e)}`)
            throw new HttpException(
              `${e?.response?.statusText}: ${errorReason}`,
              e?.response?.status
            )
          })
        )
    )

    if (requestConfig.data?.method === 'eth_sendUserOperation') {
      const userOp = { ...requestConfig.data.params[0], userOpHash: response?.result, apiKey: context.switchToHttp().getRequest().query.apiKey }
      this.logger.log(`eth_sendUserOperation: ${JSON.stringify(userOp)}`)
      try {
        if (isNil(userOp.userOpHash)) {
          this.logger.log(`No userOpHash found in: ${JSON.stringify(userOp)}`)
          throw new HttpException('UserOp should contain userOpHash', HttpStatus.BAD_REQUEST)
        }
        callMSFunction(this.dataLayerClient, 'record-user-op', userOp).catch(e => {
          this.logger.log(`record-user-op failed: ${JSON.stringify(userOp)}`)
          this.logger.log(e)
        })
      } catch (error) {
        this.logger.log(error)
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
    const config = this.configService.get(`bundler.${environment}.v07`)

    if (config.url) {
      return config.url
    } else {
      throw new InternalServerErrorException(`${capitalize(environment)} bundler environment is missing`)
    }
  }
}
