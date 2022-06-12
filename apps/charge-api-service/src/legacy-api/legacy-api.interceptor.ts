import { ApiKeysService } from '@app/api-service/api-keys/api-keys.service'
import { HttpService } from '@nestjs/axios'
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException } from '@nestjs/common'
import { lastValueFrom } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

@Injectable()
export class LegacyApiInterceptor implements NestInterceptor {
  constructor (
        private apiKeysService: ApiKeysService,
        private httpService: HttpService) { }

  async intercept (context: ExecutionContext, next: CallHandler): Promise<any> {
    const request = context.switchToHttp().getRequest()

    const ctxClassName = context.getClass().name
    const ctxHandlerName = context.getHandler().name
    const query = request.query
    const params = request.params
    const body = request.body

    let baseUrl: string = ''
    let headers: Record<string, any> = request.headers

    if (ctxClassName === 'LegacyStudioApiController' || ctxClassName === 'LegacyJobsApiController') {
      const projectJwt = await this.apiKeysService.getProjectJwt({ apiKey: query?.apiKey })
      headers = {
        Authorization: `Bearer ${projectJwt}`,
        'Content-Type': 'application/json'
      }
    }

    if (ctxClassName === 'LegacyStudioApiController') {
      baseUrl = `${process.env.LEGACY_FUSE_STUDIO_API_URL}/api/v2/admin`
    } else if (ctxClassName === 'LegacyJobsApiController') {
      baseUrl = `${process.env.LEGACY_FUSE_STUDIO_API_URL}/api/v2/jobs`
    } else if (ctxClassName === 'LegacyWalletApiController') {
      baseUrl = `${process.env.LEGACY_FUSE_WALLET_API_URL}/api/v1`
    } else if (ctxClassName === 'LegacyFuseswapApiController') {
      baseUrl = `${process.env.LEGACY_FUSE_SWAP_API_URL}/api/v1`
    }

    const config: Record<string, any> = {
      url: `${baseUrl}/${params[0]}`,
      method: ctxHandlerName,
      headers
    }

    if (Object.keys(body).length !== 0) {
      config.data = body
    }

    if (Object.keys(query).length !== 0) {
      config.params = query
    }

    console.log(config)

    const response = await lastValueFrom(this.httpService
      .request(
        config
      )
      .pipe(
        map((response) => {
          return response.data
        })
      )
      .pipe(
        catchError(e => {
          throw new HttpException(e?.response?.statusText, e?.response?.status)
        })
      )
    )

    return response
  }
}
