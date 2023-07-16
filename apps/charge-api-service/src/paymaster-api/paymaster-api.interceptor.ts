import { HttpService } from '@nestjs/axios'
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  HttpException, Inject
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { lastValueFrom } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { isEmpty } from 'lodash'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
import { accountsService } from '@app/common/constants/microservices.constants'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'

@Injectable()
export class PaymasterApiInterceptor implements NestInterceptor {
  constructor(
    @Inject(accountsService) private readonly accountClient: ClientProxy,
    private httpService: HttpService,
    private configService: ConfigService,

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
    const projectId = request.projectId.toString()
    const body = request.body
    const config = this.configService.get<Record<string, any>>(ctxClassName)
    console.log(projectId);
    const paymasterInfo = await callMSFunction(this.accountClient, 'get_paymaster_info', projectId)
    console.log(this.accountClient);

    const requestConfig: AxiosRequestConfig = {
      url: `${config?.baseUrl}`,
      method: ctxHandlerName
    }

    if (!isEmpty(body)) {
      requestConfig.data = body
    }


    return requestConfig
  }
}
