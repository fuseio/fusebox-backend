import { Inject, Injectable } from '@nestjs/common'
import { networkService } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'

@Injectable()
export class GraphqlAPIService {
  constructor (
    @Inject(networkService) private readonly networkClient: ClientProxy
  ) { }

  async getCollectiblesByOwner (address: string): Promise<any> {
    return callMSFunction(this.networkClient, 'get_collectibles_by_owner', address)
  }

  async getUserOpsBySender (address: string): Promise<any> {
    return callMSFunction(this.networkClient, 'get_userops_by_sender', address)
  }
}
