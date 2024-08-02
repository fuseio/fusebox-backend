import { DataLayerController } from '@app/smart-wallets-service/data-layer/data-layer.controller'
import { DataLayerService } from '@app/smart-wallets-service/data-layer/data-layer.service'
import { dataLayerProviders } from '@app/smart-wallets-service/data-layer/data-layer.providers'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import config from 'apps/charge-smart-wallets-service/src/data-layer/config/config'
import { DatabaseModule } from '@app/common'
import { UserOpFactory } from '@app/smart-wallets-service/common/services/user-op-factory.service'
import { UserOpParser } from '@app/smart-wallets-service/common/services/user-op-parser.service'
import { TokenService } from '@app/smart-wallets-service/common/services/token.service'
import { EthersModule } from 'nestjs-ethers'
import { CentrifugeClientProvider } from '@app/common/centrifuge/centrifugeClient.provider'
import { HttpModule } from '@nestjs/axios'
import { SmartWalletsAAEventsService } from '@app/smart-wallets-service/smart-wallets/smart-wallets-aa-events.service'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { accountsService, apiService } from '@app/common/constants/microservices.constants'
import { AnalyticsService } from '@app/common/services/analytics.service'
import { TokenModule } from '@app/common/token/token.module'

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forFeature(config),
    HttpModule,
    ConfigModule,
    TokenModule,
    EthersModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      token: 'regular-node',
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('rpcConfig')
        const { rpc } = config
        const { url, networkName, chainId } = rpc
        return {
          network: { name: networkName, chainId },
          custom: url,
          useDefaultProvider: false
        }
      }
    }),
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
    SmartWalletsAAEventsService,
    CentrifugeClientProvider,
    AnalyticsService
  ]
})

export class DataLayerModule { }
