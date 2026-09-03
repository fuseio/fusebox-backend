import { Module } from '@nestjs/common'
import { networkService } from '@app/common/constants/microservices.constants'
import { BalancesAPIController } from 'apps/charge-api-service/src/balances-api/balances-api.controller'
import { BalancesAPIService } from 'apps/charge-api-service/src/balances-api/balances-api.service'
import { ClientsModule } from '@nestjs/microservices'
import { tcpClient } from '@app/common/utils/tcp-transport'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [
    CacheModule.register({
      ttl: 10000, // in milliseconds
      max: 1000
    }),
    ClientsModule.register([
      tcpClient(networkService, process.env.NETWORK_HOST, process.env.NETWORK_TCP_PORT)
    ]),
    ApiKeyModule
  ],
  providers: [BalancesAPIService],
  controllers: [BalancesAPIController]
})
export class BalancesAPIModule { }
