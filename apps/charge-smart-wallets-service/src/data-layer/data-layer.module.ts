import { DataLayerController } from '@app/smart-wallets-service/data-layer/data-layer.controller'
import { DataLayerService } from '@app/smart-wallets-service/data-layer/data-layer.service'
import { dataLayerProviders } from '@app/smart-wallets-service/data-layer/data-layer.providers'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import web3Config from 'apps/charge-smart-wallets-service/src/common/config/web3Config'
import { DatabaseModule } from '@app/common'
import { UserOpFactory } from '@app/smart-wallets-service/common/services/user-op-factory.service'
import { UserOpParser } from '@app/smart-wallets-service/common/services/user-op-parser.service'
import { TokenService } from '@app/smart-wallets-service/common/services/token.service'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import CentrifugoAPIService from '@app/common/services/centrifugo.service'
import { CentrifugeProvider } from '@app/common/centrifuge/centrifuge.provider'
import { HttpModule } from '@nestjs/axios'
import { SmartWalletsAAEventsService } from '@app/smart-wallets-service/smart-wallets/smart-wallets-aa-events.service'
@Module({
  imports: [DatabaseModule,
    ConfigModule.forFeature(web3Config),
    HttpModule

  ],
  controllers: [DataLayerController],
  providers: [DataLayerService,
    ...dataLayerProviders, UserOpFactory,
    UserOpParser, TokenService, Web3ProviderService,
    SmartWalletsAAEventsService,
    CentrifugoAPIService,
    CentrifugeProvider
  ]
})

export class DataLayerModule { }
