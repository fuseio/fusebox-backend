import { ClientsModule, Transport } from '@nestjs/microservices'

import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { ConfigModule } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'
import { LegacyAdminApiController } from '@app/api-service/legacy-api/legacy-admin-api/legacy-admin-api.controller'
import { LegacyJobsApiController } from '@app/api-service/legacy-api/legacy-jobs-api/legacy-jobs-api.controller'
import { LegacyTradeApiController } from '@app/api-service/legacy-api/legacy-trade-api/legacy-trade-api.controller'
import { LegacyWalletApiController } from '@app/api-service/legacy-api/legacy-wallet-api/legacy-wallet-api.controller'
import { Module } from '@nestjs/common'
import { TradeApiController } from '@app/api-service/legacy-api/legacy-trade-api/legacy-trade-api-v2.controller'
import { TradeApiService } from '@app/api-service/legacy-api/legacy-trade-api/trade-api.service'
import configuration from '@app/api-service/legacy-api/config/configuration'
import { networkService } from '@app/common/constants/microservices.constants'

@Module({
  imports: [
    ApiKeyModule,
    HttpModule,
    ConfigModule.forFeature(configuration),
    ClientsModule.register([
      {
        name: networkService,
        transport: Transport.TCP,
        options: {
          host: process.env.NETWORK_HOST,
          port: parseInt(process.env.NETWORK_TCP_PORT)
        }
      }
    ])
  ],
  controllers: [
    LegacyWalletApiController,
    LegacyAdminApiController,
    LegacyJobsApiController,
    LegacyTradeApiController,
    TradeApiController
  ],
  providers: [
    TradeApiService
  ]
})
export class LegacyApiModule { }
