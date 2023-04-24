import { Module } from '@nestjs/common'
import { networkService } from '@app/common/constants/microservices.constants'
import { GraphqlAPIController } from 'apps/charge-api-service/src/graphql-api/graphql-api.controller'
import { GraphqlAPIService } from 'apps/charge-api-service/src/graphql-api/graphql-api.service'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'

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
