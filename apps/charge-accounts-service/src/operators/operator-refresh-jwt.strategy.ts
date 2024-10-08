import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { operatorRefreshJwtString } from '@app/accounts-service/operators/operators.constants'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

@Injectable()
export class OperatorRefreshJwtStrategy extends PassportStrategy(Strategy, operatorRefreshJwtString) {
  constructor (
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        OperatorRefreshJwtStrategy.extractJwtFromCookies
      ]),
      secretOrKey: configService.get('OPERATOR_REFRESH_JWT_SECRET')
    })
  }

  private static extractJwtFromCookies (request: Request): string | undefined {
    return request.cookies?.operator_refresh_token
  }

  validate (payload: unknown): unknown {
    return payload
  }
}
