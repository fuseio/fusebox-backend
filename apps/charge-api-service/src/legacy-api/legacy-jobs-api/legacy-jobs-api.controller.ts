import { IsValidApiKeysGuard } from '@app/api-service/api-keys/guards/is-valid-api-keys.guard'
import { Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { LegacyApiInterceptor } from '@app/api-service/legacy-api/legacy-api.interceptor'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Jobs')
@UseGuards(IsValidApiKeysGuard)
@UseInterceptors(LegacyApiInterceptor)
@Controller({ path: 'v0/jobs/*' })
export class LegacyJobsApiController {
  @Get()
  get () { }

  @Post()
  post () { }
}
