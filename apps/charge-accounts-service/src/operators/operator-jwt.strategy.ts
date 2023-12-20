import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { operatorJwtString } from '@app/accounts-service/operators/operators.constants';

@Injectable()
export class OperatorJwtStrategy extends PassportStrategy(Strategy, operatorJwtString) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: `${process.env.SMART_WALLETS_JWT_SECRET}`,
    });
  }

  validate(payload: unknown): unknown {
    return payload;
  }
}
