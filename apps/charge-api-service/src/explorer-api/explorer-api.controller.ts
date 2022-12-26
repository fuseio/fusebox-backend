import { Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { ExplorerApiInterceptor } from '@app/api-service/explorer-api/explorer-api.interceptor'
import { IsValidApiKeysGuard } from '@app/api-service/api-keys/guards/is-valid-api-keys.guard'

@UseGuards(IsValidApiKeysGuard)
@UseInterceptors(ExplorerApiInterceptor)
@Controller({ path: 'v0/explorer' })
export class ExplorerApiController {
  @Get()
  get () {
  }

  @Post()
  post () {
  }
}
