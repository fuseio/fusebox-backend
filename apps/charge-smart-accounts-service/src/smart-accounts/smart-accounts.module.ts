import { SmartAccountEventsGateway } from '@app/smart-accounts-service/smart-accounts/smart-account-events.gateway'
import { SmartAccountsController } from '@app/smart-accounts-service/smart-accounts/smart-accounts.controller'
import { SmartAccountsService } from '@app/smart-accounts-service/smart-accounts/smart-accounts.service'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { DatabaseModule } from '@app/common'
import configuration from '@app/smart-accounts-service/common/config/configuration'
import { smartAccountsProviders } from '@app/smart-accounts-service/smart-accounts/smart-accounts.providers'
import { HttpModule } from '@nestjs/axios'
import { SmartAccountsEventsService } from '@app/smart-accounts-service/smart-accounts/smart-accounts-events.service'
import RelayAPIService from '@app/smart-accounts-service/common/services/relay-api.service'

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forFeature(configuration),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get('SMART_ACCOUNTS_JWT_SECRET')
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
    SmartAccountsEventsService,
    RelayAPIService,
    SmartAccountEventsGateway,
    SmartAccountsService,
    ...smartAccountsProviders
  ],
  controllers: [SmartAccountsController]
})
export class SmartAccountsModule { }
