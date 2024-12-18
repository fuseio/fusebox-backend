import { Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { BundlerApiInterceptor } from '@app/api-service/bundler-api/interceptors/bundler-api.interceptor'
import { IsPrdOrSbxKeyGuard } from '@app/api-service/api-keys/guards/is-production-or-sandbox-key.guard'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Bundler for Entrypoint v0.6')
@UseGuards(IsPrdOrSbxKeyGuard)
@Controller({ path: 'v0/bundler' })
@UseInterceptors(BundlerApiInterceptor)
export class BundlerApiController {
  @Get()
  get () {
  }

  @Post()
  post () {
  }
}
