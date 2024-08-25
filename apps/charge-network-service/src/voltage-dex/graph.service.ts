import { Injectable, OnModuleInit } from '@nestjs/common'

import { ConfigService } from '@nestjs/config'
import { GraphQLClient } from 'graphql-request'

interface ClientConfig {
  name: string;
  url: string;
  defaultUrl?: string;
}

@Injectable()
export default class VoltageDexGraphService implements OnModuleInit {
  private readonly clients: Map<string, GraphQLClient> = new Map()

  private readonly clientConfigs: ClientConfig[] = [
    { name: 'block', url: 'blockGraphUrl' },
    { name: 'voltageV2', url: 'voltageV2GraphUrl' },
    { name: 'voltageV3', url: 'voltageV3GraphUrl' },
    { name: 'health', url: 'healthGraphUrl', defaultUrl: 'https://api.thegraph.com/index-node/graphql' }
  ]

  constructor (private readonly configService: ConfigService) {}

  onModuleInit (): void {
    this.initializeClients()
  }

  private initializeClients (): void {
    this.clientConfigs.forEach(this.initializeClient.bind(this))
  }

  private initializeClient ({ name, url, defaultUrl }: ClientConfig): void {
    const clientUrl = this.configService.get<string>(url) || defaultUrl
    if (clientUrl) {
      this.clients.set(name, new GraphQLClient(clientUrl))
    } else {
      throw new Error(`URL for GraphQL client '${name}' not found`)
    }
  }

  getClient (clientName: string): GraphQLClient {
    const client = this.clients.get(clientName)
    if (!client) {
      throw new Error(`GraphQL client '${clientName}' not found`)
    }
    return client
  }

  getBlockClient = (): GraphQLClient => this.getClient('block')
  getVoltageV2Client = (): GraphQLClient => this.getClient('voltageV2')
  getVoltageV3Client = (): GraphQLClient => this.getClient('voltageV3')
  getHealthClient = (): GraphQLClient => this.getClient('health')
}
