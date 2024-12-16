import { Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { BundlerApiInterceptorV0 } from '@app/api-service/bundler-api/interceptors/v0-bundler-api.interceptor'
import { IsPrdOrSbxKeyGuard } from '@app/api-service/api-keys/guards/is-production-or-sandbox-key.guard'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Bundler')
@UseGuards(IsPrdOrSbxKeyGuard)
@Controller({ path: 'bundler', version: '0' })
@UseInterceptors(BundlerApiInterceptorV0)
export class BundlerApiControllerV0 {
  @Get()
  get () {
  }

  @Post()
  post () {
  }
}
