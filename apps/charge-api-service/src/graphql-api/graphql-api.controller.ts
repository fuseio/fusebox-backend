import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { GraphqlAPIService } from '@app/api-service/graphql-api/graphql-api.service'
import { ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, getSchemaPath } from '@nestjs/swagger'

@UseGuards(IsValidPublicApiKeyGuard)
@Controller('v0/graphql')
export class GraphqlAPIController {
  constructor (
    private readonly graphqlAPIService: GraphqlAPIService
  ) { }

  @ApiTags('NFTs')
  @Get('collectibles/:address')
  @ApiOperation({
    summary: 'Get NFTs by wallet address',
    description: 'Retrieves NFTs associated with a specific wallet address, including details like creation time, token ID, and collection information.'
  })
  @ApiParam({ name: 'apiKey', type: String, required: true, description: 'Your API key to authenticate requests.' })
  @ApiParam({ name: 'address', type: String, required: true, description: 'The wallet address to query for NFTs.' })
  @ApiOkResponse({
    description: 'A list of NFTs associated with the wallet address.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath('CollectiblesResponse') }
      }
    }
  })
  @ApiForbiddenResponse({ description: 'Access to the resource is forbidden.' })
  getCollectiblesByOwner (@Param('address') address: string) {
    return this.graphqlAPIService.getCollectiblesByOwner(address)
  }

  @ApiTags('User Operations')
  @Get('userops/:address')
  @ApiOperation({
    summary: 'Get UserOps by wallet address',
    description: 'Fetches user operations for a specific wallet address, including transactions, user operation hashes, and related activity data.'
  })
  @ApiParam({ name: 'apiKey', type: String, required: true, description: 'Your API key to authenticate requests.' })
  @ApiParam({ name: 'address', type: String, required: true, description: 'The wallet address to query for user operations.' })
  @ApiOkResponse({
    description: 'A list of user operations associated with the wallet address.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath('UserOpsResponse') }
      }
    }
  })
  @ApiForbiddenResponse({ description: 'Access to the resource is forbidden.' })
  getUserOpsBySender (@Param('address') address: string) {
    return this.graphqlAPIService.getUserOpsBySender(address)
  }
}
