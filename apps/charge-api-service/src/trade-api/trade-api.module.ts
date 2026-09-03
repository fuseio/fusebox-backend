import { ClientsModule } from '@nestjs/microservices'
import { tcpClient } from '@app/common/utils/tcp-transport'

import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { TradeApiController } from '@app/api-service/trade-api/trade-api.controller'
import { TradeApiService } from '@app/api-service/trade-api/trade-api.service'
import { TradeApiV2Controller } from '@app/api-service/trade-api/trade-api-v2.controller'
import configuration from '@app/api-service/trade-api/config/configuration'
import { networkService } from '@app/common/constants/microservices.constants'

@Module({
  imports: [
    CacheModule.register({
      ttl: 600000, // in milliseconds
      max: 1000
    }),
    ApiKeyModule,
    HttpModule,
    ConfigModule.forFeature(configuration),
    ClientsModule.register([
      tcpClient(networkService, process.env.NETWORK_HOST, process.env.NETWORK_TCP_PORT)
    ])
  ],
  controllers: [
    TradeApiV2Controller,
    TradeApiController
  ],
  providers: [
    TradeApiService
  ]
})
export class TradeApiModule { }
