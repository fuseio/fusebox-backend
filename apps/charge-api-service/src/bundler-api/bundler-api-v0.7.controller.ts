import { Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { BundlerApiInterceptorV07 } from '@app/api-service/bundler-api/interceptors/v0.7-bundler-api.interceptor'
import { IsPrdOrSbxKeyGuard } from '@app/api-service/api-keys/guards/is-production-or-sandbox-key.guard'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Bundler')
@UseGuards(IsPrdOrSbxKeyGuard)
@Controller({ path: 'bundler', version: '0.7' })
@UseInterceptors(BundlerApiInterceptorV07)
export class BundlerApiControllerV07 {
  @Get()
  get () {
  }

  @Post()
  post () {
  }
}
