import GraphQLService from '@app/common/services/graphql.service'
import { Controller } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MessagePattern } from '@nestjs/microservices'
import { getCollectiblesByOwner } from '@app/network-service/common/constants/graph-queries/nfts'
import { getUserOpsBySender } from '@app/network-service/common/constants/graph-queries/aa'

@Controller('graphql')
export class GraphqlController {
  constructor (
    private readonly configService: ConfigService,
    private readonly graphQLService: GraphQLService
  ) { }

  get nftGraphUrl () {
    return this.configService.get('nftGraphUrl')
  }

  get accountAbstractionGraphUrl () {
    return this.configService.get('accountAbstractionGraphUrl')
  }

  @MessagePattern('get_collectibles_by_owner')
  getCollectiblesByOwner (address: string) {
    return this.graphQLService.fetchFromGraphQL(this.nftGraphUrl, getCollectiblesByOwner, { address: address.toLowerCase() })
  }

  @MessagePattern('get_userops_by_sender')
  getUserOpsBySender (sender: string) {
    return this.graphQLService.fetchFromGraphQL(this.accountAbstractionGraphUrl, getUserOpsBySender, { sender: sender.toLowerCase() })
  }
}
