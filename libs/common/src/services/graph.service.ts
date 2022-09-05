import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GraphQLClient } from 'graphql-request'

@Injectable()
export default class GraphService {
  private readonly voltBarClient: GraphQLClient

  constructor (
    private configService: ConfigService
  ) {
    this.voltBarClient = new GraphQLClient(this.configService.get('voltBar'))
  }

  getVoltBarClient () {
    return this.voltBarClient
  }
}
