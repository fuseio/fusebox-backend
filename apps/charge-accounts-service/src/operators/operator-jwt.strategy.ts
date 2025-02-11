import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { operatorJwtString } from '@app/accounts-service/operators/operators.constants'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

@Injectable()
export class OperatorJwtStrategy extends PassportStrategy(Strategy, operatorJwtString) {
  constructor (
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        OperatorJwtStrategy.extractJwtFromCookies
      ]),
      secretOrKey: configService.get('SMART_WALLETS_JWT_SECRET')
    })
  }

  private static extractJwtFromCookies (request: Request): string | undefined {
    return request.cookies?.operator_access_token
  }

  validate (payload: unknown): unknown {
    return payload
  }
}
