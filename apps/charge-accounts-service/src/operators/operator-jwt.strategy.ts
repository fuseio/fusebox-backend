import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { operatorJwtString } from '@app/accounts-service/operators/operators.constants'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class OperatorJwtStrategy extends PassportStrategy(Strategy, operatorJwtString) {
  constructor (
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('SMART_WALLETS_JWT_SECRET')
    })
  }

  validate (payload: unknown): unknown {
    return payload
  }
}
