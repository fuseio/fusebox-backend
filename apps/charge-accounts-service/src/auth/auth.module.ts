import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { UsersModule } from '@app/accounts-service/users/users.module'
import { JwtStrategy } from '@app/accounts-service/auth/strategies/jwt.strategy'
import { AuthController } from '@app/accounts-service/auth/auth.controller'
import { OperatorJwtStrategy } from '@app/accounts-service/auth/strategies/operator-jwt.strategy'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthService } from '@app/accounts-service/auth/auth.service'

@Module({
  imports: [
    UsersModule,
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
  providers: [JwtStrategy, OperatorJwtStrategy, AuthService],
  exports: [PassportModule, AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
