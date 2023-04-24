import { Module } from '@nestjs/common'
import { networkService } from '@app/common/constants/microservices.constants'
import { GraphqlAPIController } from './graphql-api.controller'
import { GraphqlAPIService } from './graphql-api.service'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { ApiKeyModule } from '../api-keys/api-keys.module'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: networkService,
        transport: Transport.TCP,
        options: {
          host: process.env.NETWORK_HOST,
          port: parseInt(process.env.NETWORK_TCP_PORT)
        }
      }
    ]),
    ApiKeyModule
  ],
  providers: [GraphqlAPIService],
  controllers: [GraphqlAPIController]
})
export class GraphqlAPIModule { }
