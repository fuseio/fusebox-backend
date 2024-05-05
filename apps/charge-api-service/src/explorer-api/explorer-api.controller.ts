import { Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { ExplorerApiInterceptor } from '@app/api-service/explorer-api/explorer-api.interceptor'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Explorer')
@UseGuards(IsValidPublicApiKeyGuard)
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
