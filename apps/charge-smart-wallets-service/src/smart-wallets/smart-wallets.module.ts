import { SmartWalletsController } from '@app/smart-wallets-service/smart-wallets/smart-wallets.controller'
import { SmartWalletsLegacyService } from '@app/smart-wallets-service/smart-wallets/services/smart-wallets-legacy.service'
import { SmartWalletsAAService } from '@app/smart-wallets-service/smart-wallets/services/smart-wallets-aa.service'
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
import { CentrifugeClientProvider } from '@app/common/centrifuge/centrifugeClient.provider'
import { getEnvPath } from '@app/common/utils/env.helper'
import path from 'path'
import { NotificationsModule } from '@app/api-service/notifications/notifications.module'
import { ChargeApiModule } from '@app/apps-service/charge-api/charge-api.module'
import { UsersModule } from '@app/accounts-service/users/users.module'
import { ProjectsModule } from '@app/accounts-service/projects/projects.module'
import { AnalyticsService } from '@app/common/services/analytics.service'
import { OperatorsModule } from '@app/accounts-service/operators/operators.module'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { accountsService } from '@app/common/constants/microservices.constants'
import { TokenModule } from '@app/common/token/token.module'

@Module({
  imports: [
    DatabaseModule,
    ChargeApiModule,
    NotificationsModule,
    UsersModule,
    ProjectsModule,
    TokenModule,
    OperatorsModule,
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
    CentrifugeClientProvider,
    CentrifugeProvider,
    SmartWalletsEventsService,
    RelayAPIService,
    AnalyticsService,
    SmartWalletsLegacyService,
    SmartWalletsAAService,
    ...smartWalletsProviders
  ],
  controllers: [SmartWalletsController]
})
export class SmartWalletsModule { }
