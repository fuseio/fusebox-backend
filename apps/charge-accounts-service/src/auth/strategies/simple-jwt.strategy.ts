import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { simpleJwtString } from '@app/accounts-service/auth/auth.constants';

@Injectable()
export class SimpleJwtStrategy extends PassportStrategy(Strategy, simpleJwtString) {
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
