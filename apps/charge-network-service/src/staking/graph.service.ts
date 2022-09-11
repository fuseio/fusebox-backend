import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GraphQLClient } from 'graphql-request'

@Injectable()
export default class GraphService {
  private readonly voltBarClient: GraphQLClient
  private readonly blockClient: GraphQLClient
  private readonly voltageClient: GraphQLClient

  constructor (
    private configService: ConfigService
  ) {
    this.voltBarClient = new GraphQLClient(this.configService.get('voltBarGraphUrl'))
    this.blockClient = new GraphQLClient(this.configService.get('blockGraphUrl'))
    this.voltageClient = new GraphQLClient(this.configService.get('voltageGraphUrl'))
  }

  getVoltBarClient () {
    return this.voltBarClient
  }

  getBlockClient () {
    return this.blockClient
  }

  getVoltageClient () {
    return this.voltageClient
  }
}
