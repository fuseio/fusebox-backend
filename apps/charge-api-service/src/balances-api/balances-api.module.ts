import { Module } from '@nestjs/common'
import { networkService } from '@app/common/constants/microservices.constants'
import { BalancesAPIController } from 'apps/charge-api-service/src/balances-api/balances-api.controller'
import { BalancesAPIService } from 'apps/charge-api-service/src/balances-api/balances-api.service'
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
  providers: [BalancesAPIService],
  controllers: [BalancesAPIController]
})
export class BalancesAPIModule { }
