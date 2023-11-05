import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ChargeApiService } from '@app/apps-service/charge-api/charge-api.service'
import { backendWalletProviders } from '@app/apps-service/charge-api/backend-wallet.providers'
import { DatabaseModule } from '@app/common'
import configuration from '@app/apps-service/common/config/configuration'

@Module({
  imports: [
    DatabaseModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        headers: {
          'Content-Type': 'application/json',
          'API-SECRET': `${configService.getOrThrow('CHARGE_SECRET_KEY')}`
        }
      }),
      inject: [ConfigService]
    }),
    ConfigModule.forFeature(configuration)
  ],
  providers: [ChargeApiService, ConfigService, ...backendWalletProviders],
  exports: [ChargeApiService]
})
export class ChargeApiModule { }
