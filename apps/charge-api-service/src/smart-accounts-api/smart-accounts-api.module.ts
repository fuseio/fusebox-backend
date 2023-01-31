import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { SmartAccountsAPIController } from '@app/api-service/smart-accounts-api/smart-accounts-api.controller'
import { SmartAccountsAPIService } from '@app/api-service/smart-accounts-api/smart-accounts-api.service'
import { smartAccountsService } from '@app/common/constants/microservices.constants'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from '@app/api-service/smart-accounts-api/jwt.strategy'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: smartAccountsService,
        transport: Transport.TCP,
        options: {
          host: process.env.SMART_ACCOUNTS_HOST,
          port: parseInt(process.env.SMART_ACCOUNTS_TCP_PORT)
        }
      }
    ]),
    ApiKeyModule,
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
  controllers: [SmartAccountsAPIController],
  providers: [
    SmartAccountsAPIService,
    JwtStrategy
  ]
})
export class SmartAccountsAPIModule {}
