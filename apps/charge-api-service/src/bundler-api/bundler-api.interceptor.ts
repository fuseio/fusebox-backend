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
import { BundlerProvider } from '@app/api-service/bundler-api/interfaces/bundler.interface'
import { OperatorsService } from '@app/accounts-service/operators/operators.service'

@Injectable()
export class BundlerApiInterceptor implements NestInterceptor {
  private readonly logger = new Logger(BundlerApiInterceptor.name)
  constructor (
    @Inject(smartWalletsService) private readonly dataLayerClient: ClientProxy,
    private httpService: HttpService,
    private configService: ConfigService,
    private operatorsService: OperatorsService
  ) { }

  async intercept (context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const requestConfig: AxiosRequestConfig = await this.prepareRequestConfig(
      context
    )

    const isSponsoredQuotaExceeded = await this.operatorsService.isOperatorSponsoredQuotaExceeded(context, requestConfig)
    if (isSponsoredQuotaExceeded) {
      throw new HttpException('Operator sponsored transaction quota exceeded', HttpStatus.BAD_REQUEST)
    }

    const response = await lastValueFrom(
      this.httpService
        .request(requestConfig)
        .pipe(
          map((axiosResponse: AxiosResponse) => {
            const data = axiosResponse.data
            if (data?.error) {
              this.logger.error(`BundlerApiInterceptor JSON-RPC error: ${JSON.stringify(data.error)}`)
              // Parse specific error codes
              if (data.error?.data?.includes('0xe0cff05f')) {
                this.logger.error('FailedOp: UserOperation validation failed at EntryPoint')
              }
              // For CALL_EXCEPTION errors specifically
              if (data.error?.message?.includes('CALL_EXCEPTION')) {
                this.logger.error('Transaction simulation failed - possible validation, gas, or contract execution error')
              }
            } else {
              this.logger.log(`BundlerApiInterceptor succeeded: ${JSON.stringify(data)}`)
            }
            return data
          })
        )
        .pipe(
          catchError((e) => {
            const errorData = e?.response?.data
            let errorMessage = e?.response?.statusText || 'Bundler API error'

            if (errorData?.error) {
              const error = errorData.error
              if (error.data?.includes('0xe0cff05f')) {
                errorMessage = 'UserOperation validation failed - possible causes: expired validUntil timestamp, insufficient gas, or paymaster validation failure'
                this.logger.error(`FailedOp details: ${JSON.stringify(error)}`)
              } else {
                errorMessage = error.message || errorMessage
              }
            }

            this.logger.error(`BundlerApiInterceptor error: ${JSON.stringify(e)}`)
            throw new HttpException(errorMessage, e?.response?.status || 500)
          })
        )
    )

    if (requestConfig.data?.method === 'eth_sendUserOperation') {
      const userOp = this.constructUserOp(context, requestConfig, response)
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
    const config = this.configService.get(`bundler.${environment}`)

    if (config?.url) {
      return config.url
    } else {
      throw new InternalServerErrorException(`${capitalize(environment)} bundler environment is missing`)
    }
  }

  private constructUserOp (context: ExecutionContext, requestConfig: AxiosRequestConfig, response) {
    const request = context.switchToHttp().getRequest()
    const param = requestConfig?.data?.params?.[0]
    const base = { userOpHash: response?.result, apiKey: request.query.apiKey }

    if (!param) {
      throw new InternalServerErrorException('UserOp param is missing')
    }

    return {
      ...param,
      ...base,
      initCode: param.initCode ?? '0x',
      sponsorId: param.paymaster ? BundlerProvider.PIMLICO : undefined,
      paymasterAndData: param.paymasterData,
      paymasterData: undefined
    }
  }
}
