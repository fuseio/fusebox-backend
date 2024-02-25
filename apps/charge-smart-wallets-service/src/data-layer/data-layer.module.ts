import { DataLayerController } from '@app/smart-wallets-service/data-layer/data-layer.controller'
import { DataLayerService } from '@app/smart-wallets-service/data-layer/data-layer.service'
import { dataLayerProviders } from '@app/smart-wallets-service/data-layer/data-layer.providers'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import config from 'apps/charge-smart-wallets-service/src/data-layer/config/config'
import { DatabaseModule } from '@app/common'
import { UserOpFactory } from '@app/smart-wallets-service/common/services/user-op-factory.service'
import { UserOpParser } from '@app/smart-wallets-service/common/services/user-op-parser.service'
import { TokenService } from '@app/smart-wallets-service/common/services/token.service'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import CentrifugoAPIService from '@app/common/services/centrifugo.service'
import { CentrifugeProvider } from '@app/common/centrifuge/centrifuge.provider'
import { HttpModule } from '@nestjs/axios'
import { SmartWalletsAAEventsService } from '@app/smart-wallets-service/smart-wallets/smart-wallets-aa-events.service'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { accountsService, apiService } from '@app/common/constants/microservices.constants'
import { AnalyticsService } from '@app/common/services/analytics.service'

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forFeature(config),
    HttpModule,
    ClientsModule.register([
      {
        name: accountsService,
        transport: Transport.TCP,
        options: {
          host: process.env.ACCOUNTS_HOST,
          port: parseInt(process.env.ACCOUNTS_TCP_PORT)
        }
      }
    ]),
    ClientsModule.register([
      {
        name: apiService,
        transport: Transport.TCP,
        options: {
          host: process.env.API_HOST,
          port: parseInt(process.env.API_TCP_PORT)
        }
      }
    ])
  ],
  controllers: [DataLayerController],
  providers: [
    DataLayerService,
    ...dataLayerProviders,
    UserOpFactory,
    UserOpParser,
    TokenService,
    Web3ProviderService,
    SmartWalletsAAEventsService,
    CentrifugoAPIService,
    CentrifugeProvider,
    AnalyticsService
  ]
})

export class DataLayerModule { }
