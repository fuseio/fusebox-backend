import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { SmartWalletsAPIController } from '@app/api-service/smart-wallets-api/smart-wallets-api.controller'
import { SmartWalletsAPIV2Controller } from '@app/api-service/smart-wallets-api/smart-wallets-api-v2.controller'
import { SmartWalletsAPIService } from '@app/api-service/smart-wallets-api/smart-wallets-api.service'
import { smartWalletsService } from '@app/common/constants/microservices.constants'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { ClientsModule } from '@nestjs/microservices'
import { tcpClient } from '@app/common/utils/tcp-transport'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from '@app/api-service/smart-wallets-api/jwt.strategy'

@Module({
  imports: [
    ClientsModule.register([
      tcpClient(smartWalletsService, process.env.SMART_WALLETS_HOST, process.env.SMART_WALLETS_TCP_PORT)
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
  controllers: [
    SmartWalletsAPIController,
    SmartWalletsAPIV2Controller
  ],
  providers: [
    SmartWalletsAPIService,
    JwtStrategy
  ]
})
export class SmartWalletsAPIModule {}
