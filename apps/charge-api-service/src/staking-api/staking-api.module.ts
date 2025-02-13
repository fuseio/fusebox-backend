import { Module } from '@nestjs/common'
import { networkService } from '@app/common/constants/microservices.constants'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { StakingApiController } from '@app/api-service/staking-api/staking-api.controller'
import { StakingAPIService } from '@app/api-service/staking-api/staking-api.service'
import { StakingApiV2Controller } from './staking-api-v2.controller'

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
  providers: [StakingAPIService],
  controllers: [StakingApiController, StakingApiV2Controller]
})
export class StakingAPIModule {}
