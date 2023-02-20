import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { SmartWalletsAPIController } from '@app/api-service/smart-wallets-api/smart-wallets-api.controller'
import { SmartWalletsAPIService } from '@app/api-service/smart-wallets-api/smart-wallets-api.service'
import { smartWalletsService } from '@app/common/constants/microservices.constants'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from '@app/api-service/smart-wallets-api/jwt.strategy'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: smartWalletsService,
        transport: Transport.TCP,
        options: {
          host: process.env.SMART_WALLETS_HOST,
          port: parseInt(process.env.SMART_WALLETS_TCP_PORT)
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
        const jwtSecret = configService.get('SMART_WALLETS_JWT_SECRET')
        return {
          secret: jwtSecret
        }
      }
    })
  ],
  controllers: [SmartWalletsAPIController],
  providers: [
    SmartWalletsAPIService,
    JwtStrategy
  ]
})
export class SmartWalletsAPIModule {}
