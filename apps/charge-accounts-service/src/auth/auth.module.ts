import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { UsersModule } from '@app/accounts-service/users/users.module'
import { JwtStrategy } from '@app/accounts-service/auth/jwt.strategy'
import { AuthController } from '@app/accounts-service/auth/auth.controller'

@Module({
  imports: [UsersModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [JwtStrategy],
  exports: [PassportModule],
  controllers: [AuthController]
})
export class AuthModule {}
