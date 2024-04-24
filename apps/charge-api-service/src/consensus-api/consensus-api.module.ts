import { Module } from '@nestjs/common'
import { networkService } from '@app/common/constants/microservices.constants'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { ConsensusApiController } from '@app/api-service/consensus-api/consensus-api.controller'
import { ConsensusApiService } from '@app/api-service/consensus-api/consensus-api.service'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [
    CacheModule.register({
      ttl: 60000, // in milliseconds
      max: 1000
    }),
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
  providers: [ConsensusApiService],
  controllers: [ConsensusApiController]
})

export class ConsensusApiModule {}
