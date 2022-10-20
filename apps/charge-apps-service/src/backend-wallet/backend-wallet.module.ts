import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BackendWalletService } from '@app/apps-service/backend-wallet/backend-wallet.service'
import { backendWalletProviders } from '@app/apps-service/backend-wallet/backend-wallet.providers'
import { DatabaseModule } from '@app/common'

@Module({
  imports: [
    DatabaseModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        headers: {
          'Content-Type': 'application/json',
          'API-SECRET': `${configService.get('CHARGE_SECRET_KEY')}`
        }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [BackendWalletService, ConfigService, ...backendWalletProviders],
  exports: [BackendWalletService]
})
export class BackendWalletModule { }
