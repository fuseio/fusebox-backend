import { Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { BundlerApiInterceptor } from '@app/api-service/bundler-api/bundler-api.interceptor'
import { IsPrdOrSbxKeyGuard } from '@app/api-service/api-keys/guards/is-production-or-sandbox-key.guard'
import { GrpcMethod } from '@nestjs/microservices'

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
