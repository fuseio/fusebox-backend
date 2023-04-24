import GraphQLService from '@app/common/services/graphql.service'
import { Controller } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MessagePattern } from '@nestjs/microservices'
import { getCollectiblesByOwner } from '../common/constants/graph-queries/nfts'

@Controller('graphql')
export class GraphqlController {
  constructor (
    private readonly configService: ConfigService,
    private readonly graphQLService: GraphQLService
  ) { }

  @MessagePattern('get_collectibles_by_owner')
  getCollectiblesByOwner (address: string) {
    const url = this.configService.get('nftGraphUrl')
    return this.graphQLService.fetchFromGraphQL(url, getCollectiblesByOwner, { address: address.toLowerCase() })
  }
}
