import { IsValidApiKeysGuard } from '@app/api-service/api-keys/guards/is-valid-api-keys.guard'
import { Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { LegacyApiInterceptor } from '../legacy-api.interceptor'

@UseGuards(IsValidApiKeysGuard)
@UseInterceptors(LegacyApiInterceptor)
@Controller({ path: 'v0/jobs/*' })
export class LegacyJobsApiController {
  @Get()
  get () { }

  @Post()
  post () { }
}
