import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { UsersModule } from '@app/accounts-service/users/users.module'
import { JwtStrategy } from '@app/accounts-service/auth/jwt.strategy'
import { AuthController } from '@app/accounts-service/auth/auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'

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
  providers: [JwtStrategy],
  exports: [PassportModule, JwtModule],
  controllers: [AuthController]
})
export class AuthModule {}
