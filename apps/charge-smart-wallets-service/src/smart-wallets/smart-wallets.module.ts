import { SmartWalletsController } from '@app/smart-wallets-service/smart-wallets/smart-wallets.controller'
import { SmartWalletsService } from '@app/smart-wallets-service/smart-wallets/smart-wallets.service'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { DatabaseModule } from '@app/common'
import configuration from 'apps/charge-smart-wallets-service/src/common/config/configuration'
import { smartWalletsProviders } from '@app/smart-wallets-service/smart-wallets/smart-wallets.providers'
import { HttpModule } from '@nestjs/axios'
import { SmartWalletsEventsService } from '@app/smart-wallets-service/smart-wallets/smart-wallets-events.service'
import RelayAPIService from 'apps/charge-smart-wallets-service/src/common/services/relay-api.service'
import { CentrifugeProvider } from '@app/common/centrifuge/centrifuge.provider'
import CentrifugoAPIService from '@app/common/services/centrifugo.service'
import { getEnvPath } from '@app/common/utils/env.helper'
import path from 'path'

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: getEnvPath(path.join(__dirname, 'common/config')),
      load: [configuration]
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get('SMART_WALLETS_JWT_SECRET')
        return {
          secret: jwtSecret
        }
      }
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${configService.get('fuseWalletBackendJwt')}`
        }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [
    CentrifugoAPIService,
    CentrifugeProvider,
    SmartWalletsEventsService,
    RelayAPIService,
    SmartWalletsService,
    ...smartWalletsProviders
  ],
  controllers: [SmartWalletsController]
})
export class SmartWalletsModule { }
