import { Module } from '@nestjs/common'
import { OperatorsService } from '@app/accounts-service/operators/operators.service'
import { OperatorsController } from '@app/accounts-service/operators/operators.controller'
import { JwtStrategy } from '@app/accounts-service/auth/jwt.strategy'
import { PassportModule } from '@nestjs/passport'
import { JwtModule, JwtModuleAsyncOptions } from '@nestjs/jwt'
import { passportJwtSecret } from 'jwks-rsa'

const jwtModuleAsyncOptions: JwtModuleAsyncOptions = {
  /**
  useFactory: async () => ({
    secretOrKeyProvider: passportJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${process.env.AUTH0_ISSUER_URL}.well-known/jwks.json`,
    }),
    signOptions: {
      expiresIn: '30d',
      algorithm: 'RS256',
      audience: process.env.AUTH0_AUDIENCE,
      issuer: process.env.AUTH0_ISSUER_URL,
    },
  }),
  */
};

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync(jwtModuleAsyncOptions)
  ],
  controllers: [OperatorsController],
  providers: [OperatorsService, JwtStrategy],
  exports: [OperatorsService]
})
export class OperatorsModule {}
