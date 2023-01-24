import { SmartAccountEventsGateway } from '@app/smart-accounts-service/smart-accounts/smart-account-events.gateway'
import { SmartAccountsController } from '@app/smart-accounts-service/smart-accounts/smart-accounts.controller'
import { SmartAccountsService } from '@app/smart-accounts-service/smart-accounts/smart-accounts.service'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get('SMART_ACCOUNTS_JWT_SECRET')
        return {
          secret: jwtSecret
        }
      }
    })
  ],
  providers: [SmartAccountEventsGateway, SmartAccountsService],
  controllers: [SmartAccountsController]
})
export class SmartAccountsModule {}
