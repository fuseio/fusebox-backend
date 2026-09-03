import { Module } from '@nestjs/common'
import { networkService } from '@app/common/constants/microservices.constants'
import { ClientsModule } from '@nestjs/microservices'
import { tcpClient } from '@app/common/utils/tcp-transport'
import { ConsensusApiController } from '@app/api-service/consensus-api/consensus-api.controller'
import { ConsensusApiService } from '@app/api-service/consensus-api/consensus-api.service'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [
    CacheModule.register({
      ttl: 60000, // in milliseconds
      max: 1000
    }),
    ClientsModule.register([
      tcpClient(networkService, process.env.NETWORK_HOST, process.env.NETWORK_TCP_PORT)
    ])
  ],
  providers: [ConsensusApiService],
  controllers: [ConsensusApiController]
})

export class ConsensusApiModule {}
