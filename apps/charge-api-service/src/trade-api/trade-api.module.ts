import { ClientsModule, Transport } from '@nestjs/microservices'

import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
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
    TradeApiV2Controller,
    TradeApiController
  ],
  providers: [
    TradeApiService
  ]
})
export class TradeApiModule { }
