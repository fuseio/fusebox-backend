import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { GraphqlAPIService } from '@app/api-service/graphql-api/graphql-api.service'

@UseGuards(IsValidPublicApiKeyGuard)
@Controller('v0/graphql')
export class GraphqlAPIController {
  constructor (
    private readonly graphqlAPIService: GraphqlAPIService
  ) { }

  @Get('collectibles/:address')
  getCollectiblesByOwner (@Param('address') address: string) {
    return this.graphqlAPIService.getCollectiblesByOwner(address)
  }

  @Get('userops/:address')
  getUserOpsBySender (@Param('address') address: string) {
    return this.graphqlAPIService.getUserOpsBySender(address)
  }
}
