import { Controller, Get, Post, UseInterceptors } from '@nestjs/common'
import { LegacyApiInterceptor } from '../legacy-api.interceptor'

@UseInterceptors(LegacyApiInterceptor)
@Controller({ path: 'v0/studio/*' })
export class LegacyStudioApiController {
  @Get()
  get () { }

  @Post()
  post () { }
}
