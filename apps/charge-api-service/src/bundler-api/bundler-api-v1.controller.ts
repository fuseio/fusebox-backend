import { Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { IsPrdOrSbxKeyGuard } from '@app/api-service/api-keys/guards/is-production-or-sandbox-key.guard'
import { BundlerApiInterceptorV1 } from '@app/api-service/bundler-api/interceptors/bundler-api-v1.interceptor'

@ApiTags('Bundler for Entrypoint v0.7')
@UseGuards(IsPrdOrSbxKeyGuard)
@Controller({ path: 'v1/bundler' })
@UseInterceptors(BundlerApiInterceptorV1)
export class BundlerApiControllerV1 {
  @Get()
  get () {
  }

  @Post()
  post () {
  }
}
