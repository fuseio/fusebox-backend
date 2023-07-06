import { HttpService } from '@nestjs/axios'
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  HttpException,
  CallHandler
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { lastValueFrom, Observable } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { isEmpty } from 'lodash'
import { AxiosRequestConfig, AxiosResponse } from 'axios'

@Injectable()
export class BundlerApiInterceptor implements NestInterceptor {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const requestConfig: AxiosRequestConfig = await this.prepareRequestConfig(
      context
    );

    const response = await lastValueFrom(
      this.httpService
        .request(requestConfig)
        .pipe(
          map((axiosResponse: AxiosResponse) => {
            return axiosResponse.data;
          })
        )
        .pipe(
          catchError((e) => {
            const errorReason =
              e?.response?.data?.error ||
              e?.response?.data?.errors?.message ||
              '';

            throw new HttpException(
              `${e?.response?.statusText}: ${errorReason}`,
              e?.response?.status
            );
          })
        )
    );

    return next.handle().pipe(map(() => response));
  }

  private async prepareRequestConfig(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    const requestEnvironment = request.environment
    const ctxHandlerName = context.getHandler().name
    const body = request.body
    const requestConfig: AxiosRequestConfig = {
      url: this.prepareUrl(requestEnvironment, context),
      method: ctxHandlerName
    }

    if (!isEmpty(body)) {
      requestConfig.data = body
    }


    return requestConfig
  }

  private prepareUrl(environment, context: ExecutionContext) {
    const ctxClassName = context.getClass().name
    const config = this.configService.get<Record<string, any>>(ctxClassName)
    console.log(environment);
    if (environment === 'production') return config?.productionUrl
    if (environment === 'sandbox') return config?.sandboxUrl
    return 'Environment error'
  }



}
